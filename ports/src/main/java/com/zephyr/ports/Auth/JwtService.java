package com.zephyr.ports.Auth;


import java.security.Key;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class JwtService {

    @Value("${spring.profiles.active:prod}")
    private String activeProfile;

    @Value("${app.domain:api.example.com}")
    private String domain;

    @Value("${security.jwt.secret-key:}")
    private String secretKey;
    private final long jwtExpiration = 3600000; // 1 hour

    private final List<String> allowedDomains = Arrays.asList("localhost", "api.example.com");

    
 public ResponseCookie createSecureCookie(String token) {
        return ResponseCookie.from("jwtToken", token)
                .httpOnly(true)          // Prevents JavaScript access
                .secure(true)            // Only sent over HTTPS
                .sameSite("Strict")      // Prevents CSRF
                .path("/")               // Available on all paths
                .maxAge(jwtExpiration / 1000) // Convert milliseconds to seconds
                .build();
    }
    public void setSecurityHeadersAndCookie(HttpServletResponse response, String token) {
        // Set security headers
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-XSS-Protection", "1; mode=block");
        response.setHeader("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
        
        // Set secure cookie
        ResponseCookie cookie = createSecureCookie(token);
        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    public long getExpirationTime() {
        return jwtExpiration;
    }

    public String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration
    ) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // public boolean isTokenValid(String token, UserDetails userDetails) {
    //     final String username = extractUsername(token);
    //     return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    // }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Base64.getEncoder().encode(secretKey.getBytes());
    return Keys.hmacShaKeyFor(keyBytes);
    }



    
    public String getDomain(HttpServletRequest request) {
        String serverName = request.getServerName();
        return allowedDomains.contains(serverName) ? serverName : domain;
    }

    public String generateToken(UserDetails userDetails, HttpServletRequest request) {
        String currentDomain = getDomain(request);
        Map<String, Object> claims = new HashMap<>();
        claims.put("iss", currentDomain);
        claims.put("aud", currentDomain);
        claims.put("type", "access");
        claims.put("fingerprint", generateFingerprint(userDetails, request));
        return generateToken(claims, userDetails);
    }

    private String generateFingerprint(UserDetails userDetails, HttpServletRequest request) {
        // Create a unique fingerprint based on user attributes and request
        String userAgent = request.getHeader("User-Agent") != null ? 
                          request.getHeader("User-Agent") : "";
        String uniqueData = userDetails.getUsername() + 
                           userDetails.getAuthorities().toString() +
                           userAgent +
                           secretKey;
        return Base64.getEncoder().encodeToString(
            DigestUtils.sha256(uniqueData.getBytes())
        );
    }


    public boolean isTokenValid(String token, UserDetails userDetails, HttpServletRequest request) {
        final String username = extractUsername(token);
        final Claims claims = extractAllClaims(token);
        String currentDomain = getDomain(request);
        
        // Verify token was issued by allowed domain
        if (!claims.getIssuer().equals(currentDomain)) {
            return false;
        }
        
        // Verify audience
        if (!claims.getAudience().equals(currentDomain)) {
            return false;
        }
        
        // Verify fingerprint
        String expectedFingerprint = generateFingerprint(userDetails, request);
        if (!claims.get("fingerprint").equals(expectedFingerprint)) {
            return false;
        }
        
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    public ResponseCookie createSecureCookie(String tokenName, String token, HttpServletRequest request) {
        String currentDomain = getDomain(request);
        boolean isLocalhost = "localhost".equals(currentDomain);


        
        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from(tokenName, token)
                .httpOnly(true)
                .secure(!isLocalhost) // Only false for localhost
                .sameSite(isLocalhost ? "Lax" : "Strict") // Lax for localhost, Strict for production
                .path("/")
                .maxAge(jwtExpiration / 1000);

        // Only set domain for non-localhost
        if (!isLocalhost) {
            cookieBuilder.domain(currentDomain);
        }

        return cookieBuilder.build();
    }

 

    public String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration,
            HttpServletRequest request
    ) {

        String currentDomain = getDomain(request);
        
        // Add standard claims
        extraClaims.put("iss", currentDomain);
        extraClaims.put("aud", currentDomain);
        extraClaims.put("type", "access");
        extraClaims.put("fingerprint", generateFingerprint(userDetails, request));

        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Update the refresh token generation to use the new buildToken method
    public String createRefreshToken(UserDetails userDetails, HttpServletRequest request) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        return buildToken(claims, userDetails, jwtExpiration * 24 * 7, request); // 7 days
    }

   
   

}


