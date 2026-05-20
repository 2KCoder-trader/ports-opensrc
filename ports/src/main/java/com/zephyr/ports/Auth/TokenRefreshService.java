package com.zephyr.ports.Auth;

import java.util.Date;
import java.util.HashMap;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class TokenRefreshService {
    private final JwtService jwtService;
    private final long refreshTokenExpiration = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    public TokenRefreshService(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public String createRefreshToken(UserDetails userDetails, HttpServletRequest request) {
        return jwtService.buildToken(new HashMap<>(), userDetails, refreshTokenExpiration, request);
    }

    public ResponseCookie createRefreshCookie(String token, HttpServletRequest request) {
        String currentDomain = jwtService.getDomain(request);
        boolean isLocalhost = "localhost".equals(currentDomain);
        
        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(!isLocalhost)
                .sameSite(isLocalhost ? "Lax" : "Strict")
                .path("/api/auth/refresh")
                .maxAge(refreshTokenExpiration / 1000);

        if (!isLocalhost) {
            cookieBuilder.domain(currentDomain);
        }

        return cookieBuilder.build();
    }

    public boolean shouldTokenBeRefreshed(String token) {
        try {
            Date expiration = jwtService.extractExpiration(token);
            Date now = new Date();
            // Refresh if token is going to expire in 5 minutes
            return (expiration.getTime() - now.getTime()) < (5 * 60 * 1000);
        } catch (Exception e) {
            return false;
        }
    }

    // Add the missing method
    protected String extractTokenFromRequest(HttpServletRequest request) {
        // First try to get from cookies
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwtToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        // If not in cookies, try Authorization header
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        return null;
    }

    public void refreshTokenIfNeeded(HttpServletRequest request, HttpServletResponse response, UserDetails userDetails) {
        String currentToken = extractTokenFromRequest(request);
        if (currentToken != null && jwtService.isTokenValid(currentToken, userDetails, request) && 
            shouldTokenBeRefreshed(currentToken)) {
            
            String newToken = jwtService.generateToken(userDetails, request);
            String refreshToken = createRefreshToken(userDetails, request);
            
            // Set new cookies
            ResponseCookie jwtCookie = jwtService.createSecureCookie("jwtToken" ,newToken, request);
            ResponseCookie refreshCookie = createRefreshCookie(refreshToken, request);
            
            response.setHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());
            response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        }
    }

    // Helper method to get refresh token from request
    protected String extractRefreshTokenFromRequest(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    // Method to check if refresh token is valid
    public boolean isRefreshTokenValid(String token, UserDetails userDetails, HttpServletRequest request) {
        try {
            return jwtService.isTokenValid(token, userDetails, request);
        } catch (Exception e) {
            return false;
        }
    }
}