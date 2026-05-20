package com.zephyr.ports.Auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;
    
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final HandlerExceptionResolver handlerExceptionResolver;

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TokenRefreshService tokenRefreshService;
    
    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserDetailsService userDetailsService,
            HandlerExceptionResolver handlerExceptionResolver,
            TokenRefreshService tokenRefreshService
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.handlerExceptionResolver = handlerExceptionResolver;
        this.tokenRefreshService = tokenRefreshService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            String jwt = null;
            Cookie[] cookies = request.getCookies();
            
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("jwtToken".equals(cookie.getName())) {
                        jwt = cookie.getValue();
                        break;
                    }
                }
            }

            if (jwt != null) {
                String userEmail = jwtService.extractUsername(jwt);
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                if (userEmail != null && authentication == null) {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                    
                    if (jwtService.isTokenValid(jwt, userDetails,request)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        
                        // Check and refresh token if needed
                        tokenRefreshService.refreshTokenIfNeeded(request, response, userDetails);
                    }
                }
            }
            
            filterChain.doFilter(request, response);
        } catch (Exception exception) {
            logger.error("JWT Authentication error", exception);
            handlerExceptionResolver.resolveException(request, response, null, exception);
        }
    }


    //     final String authHeader = request.getHeader("Authorization");

    //     if (authHeader == null || !authHeader.startsWith("Bearer ")) {
    //         filterChain.doFilter(request, response);
    //         return;
    //     }

    //     try {
    //         final String jwt = authHeader.substring(7);
    //         final String userEmail = jwtService.extractUsername(jwt);

    //         Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    //         if (userEmail != null && authentication == null) {
    //             UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

    //             if (jwtService.isTokenValid(jwt, userDetails)) {
    //                 UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
    //                         userDetails,
    //                         null,
    //                         userDetails.getAuthorities()
    //                 );

    //                 authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
    //                 SecurityContextHolder.getContext().setAuthentication(authToken);
    //             }
    //         }

    //         filterChain.doFilter(request, response);
    //     } catch (Exception exception) {
    //         handlerExceptionResolver.resolveException(request, response, null, exception);
    //     }
    // }
}