package com.zephyr.ports;

import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandlerImpl;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.multipart.MultipartFile;
import javax.servlet.ServletOutputStream;

import com.zephyr.ports.Auth.JwtAuthenticationFilter;

import jakarta.servlet.WriteListener;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import jakarta.servlet.http.HttpServletRequestWrapper;
import java.io.ByteArrayOutputStream;
import java.io.CharArrayWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Collection;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfiguration(
        @Lazy JwtAuthenticationFilter jwtAuthenticationFilter,
        AuthenticationProvider authenticationProvider
    ) {
        this.authenticationProvider = authenticationProvider;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )  .headers(headers -> headers
            .xssProtection() // Enables XSS protection
            .and()
            .frameOptions(frame -> frame.deny())
            .contentSecurityPolicy(csp -> csp
                .policyDirectives("default-src 'self'; frame-ancestors 'none';"))
            .referrerPolicy(referrer -> referrer
                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.SAME_ORIGIN))
        )
        
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/ports/user/verifyuser").permitAll()
                .requestMatchers("/ports/user/saveUsers").permitAll()
                .requestMatchers("/ports/user/google-signin").permitAll()
                .requestMatchers("/ports/user/verify").permitAll()
                .requestMatchers("/ports/user/loginuser").permitAll()
                .requestMatchers("/ports/user/verifyLogo").permitAll()
                .requestMatchers("/ports/user/sendForgotEmail").permitAll()
                .requestMatchers("/ports/user/ForgotPass").permitAll()
                .requestMatchers("/ports/user/verifyForgotPassword").permitAll()
                .requestMatchers("/ports/Portfolio/searchPublicPorts").permitAll()
                .requestMatchers("/ports/Portfolio/getChartData").permitAll()
                .anyRequest().authenticated()
            ) .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                .accessDeniedHandler(new AccessDeniedHandlerImpl())
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Set allowed origins - be specific for production
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "https://example.com",
            "exp://localhost:19000"
        ));
        
        // Set allowed methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Set allowed headers
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
            "X-Requested-With"
        ));
        
        // Allow credentials (cookies)
        configuration.setAllowCredentials(true);
        // Expose headers that client might need
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials"
        ));
        
        // Cache preflight requests for 1 hour
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }



    @Component
    public class HtmlSanitizer {
        private final PolicyFactory policy = Sanitizers.FORMATTING
                .and(Sanitizers.BLOCKS)
                .and(Sanitizers.LINKS)
                .and(Sanitizers.STYLES)
                .and(Sanitizers.TABLES)
                .and(Sanitizers.IMAGES);
        

        private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
        );
    
 
        private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

        private static final Pattern EMAIL_PATTERN = 
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
        private boolean isValidImageContent(byte[] content) {
                if (content.length < 4) {
                    return false;
                }
                return true;
            }
  
   public static HttpServletRequest sanitizeRequest(HttpServletRequest request) {
        return new SanitizedRequestWrapper(request);
    }

    public static HttpServletResponse sanitizeResponse(HttpServletResponse response) {
        return new SanitizedResponseWrapper(response);
    }

    private static class SanitizedRequestWrapper extends HttpServletRequestWrapper {
        private final Map<String, String> sanitizedParams = new HashMap<>();

        public SanitizedRequestWrapper(HttpServletRequest request) {
            super(request);
            sanitizeParameters(request);
        }

        private void sanitizeParameters(HttpServletRequest request) {
            Enumeration<String> paramNames = request.getParameterNames();
            while (paramNames.hasMoreElements()) {
                String paramName = paramNames.nextElement();
                String[] values = request.getParameterValues(paramName);

                if (values != null && values.length > 0) {
                    String joinedValues = String.join(",", values);
                    sanitizedParams.put(paramName, sanitizeString(joinedValues));
                }
            }
        }

        @Override
        public String getParameter(String name) {
            return sanitizedParams.getOrDefault(name, super.getParameter(name));
        }

        @Override
        public String[] getParameterValues(String name) {
            String sanitizedValue = sanitizedParams.get(name);
            return sanitizedValue != null ? new String[]{sanitizedValue} : super.getParameterValues(name);
        }

        @Override
        public Map<String, String[]> getParameterMap() {
            Map<String, String[]> parameterMap = new HashMap<>();
            sanitizedParams.forEach((key, value) -> parameterMap.put(key, new String[]{value}));
            return parameterMap;
        }

        private String sanitizeString(String input) {
            if (input == null) {
                return "";
            }
            // Sanitization logic
            return input.replaceAll("<.*?>", "") // Remove HTML tags
                        .replaceAll("['\"\\]", "") // Remove quotes and backslashes
                        .replaceAll("[<>]", "") // Remove angle brackets
                        .trim();
        }
    }

    private static class SanitizedResponseWrapper extends HttpServletResponseWrapper {
        private final CharArrayWriter charWriter = new CharArrayWriter();
        private PrintWriter writer;
        private final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        private ServletOutputStream servletOutputStream;
    
        public SanitizedResponseWrapper(HttpServletResponse response) {
            super(response);
        }
    
        @Override
        public PrintWriter getWriter() throws IOException {
            if (writer == null) {
                writer = new PrintWriter(charWriter);
            }
            return writer;
        }
    
        // @Override
        // public jakarta.servlet.ServletOutputStream getOutputStream() throws IOException {
        //     if (servletOutputStream == null) {
        //         servletOutputStream = new FilterServletOutputStream(outputStream);
        //     }
        //     return servletOutputStream;
        // }
    
        public String getContent() {
            if (writer != null) {
                writer.flush();
                return sanitizeString(charWriter.toString());
            }
            return "";
        }
    
        public byte[] getContentAsBytes() throws IOException {
            if (servletOutputStream != null) {
                servletOutputStream.flush();
                return outputStream.toByteArray();
            }
            return new byte[0];
        }

        private String sanitizeString(String input) {
            if (input == null) {
                return "";
            }
            // Sanitization logic
            return input.replaceAll("<.*?>", "") // Remove HTML tags
                        .replaceAll("['\"\\]", "") // Remove quotes and backslashes
                        .replaceAll("[<>]", "") // Remove angle brackets
                        .trim();
        }
    }
    

    private static class FilterServletOutputStream extends ServletOutputStream {
        private final ByteArrayOutputStream outputStream;
    
        public FilterServletOutputStream(ByteArrayOutputStream outputStream) {
            this.outputStream = outputStream;
        }
    
        @Override
        public void write(int b) throws IOException {
            outputStream.write(b);
        }
    
        // @Override
        public boolean isReady() {
            return true;
        }
    
        // @Override
        public void setWriteListener(WriteListener writeListener) {
            // No operation; implement if needed for async support
        }
    }
    






        public <T> T sanitize(T object) {
            if (object == null) {
                return null;
            }
    
            try {
              
                if (object instanceof String) {
                    return (T) sanitizeString((String) object);
                }
    
            
                if (object instanceof Collection<?>) {
                    ((Collection<?>) object).forEach(this::sanitize);
                    return object;
                }
    
               
                if (object instanceof Map<?, ?>) {
                    ((Map<?, ?>) object).values().forEach(this::sanitize);
                    return object;
                }
    
             
                if (object.getClass().isArray()) {
                    Object[] array = (Object[]) object;
                    for (int i = 0; i < array.length; i++) {
                        array[i] = sanitize(array[i]);
                    }
                    return object;
                }
    
              
                if (isSystemClass(object.getClass())) {
                    return object;
                }
    
           
                for (Field field : object.getClass().getDeclaredFields()) {
                    field.setAccessible(true);
                    Object value = field.get(object);
    
                    if (value == null) {
                        continue;
                    }
    
                    if (value instanceof String) {
                      
                        boolean isEmailField = field.getName().toLowerCase().contains("email");
                        String sanitized = isEmailField ? 
                            sanitizeEmail((String) value) : 
                            sanitizeString((String) value);
                        field.set(object, sanitized);
                    }
                    else if (!field.getType().isPrimitive()) {
                        field.set(object, sanitize(value));
                    }
                }
    
                return object;
    
            } catch (IllegalAccessException e) {
                throw new RuntimeException("Error during sanitization", e);
            }
        }
    
        private String sanitizeString(String input) {
            if (input == null) {
                return null;
            }
        
            // Decode HTML entities first
            String decoded = decodeHtmlEntities(input);
            System.out.println(decoded);
            // If it looks like an email, treat it as such
            if (looksLikeEmail(decoded)) {
                return sanitizeEmail(decoded);
            }
        
            // Regular HTML sanitization for non-email content
            return policy.sanitize(decoded);
        }
    
        private String sanitizeEmail(String email) {
            if (email == null) {
                return null;
            }
    
            // First decode any HTML entities
            String decoded = decodeHtmlEntities(email);
            
            // If it matches email pattern, return as is
            if (EMAIL_PATTERN.matcher(decoded).matches()) {
                return decoded;
            }
    
            // If it doesn't match email pattern, sanitize normally
            return policy.sanitize(email);
        }
    
        private boolean looksLikeEmail(String input) {
            if (input == null) {
                return false;
            }
            return input.contains("@") && input.contains(".");
        }


        private String decodeHtmlEntities(String input) {
            return input
                .replace("&#64;", "@")
                .replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&quot;", "\"")
                .replace("&#x27;", "'")
                .replace("&#x2F;", "/")
                .replace("&apos;", "'")
                .replace("&nbsp;", " ")
                .replace("&cent;", "¢")
                .replace("&pound;", "£")
                .replace("&yen;", "¥")
                .replace("&euro;", "€")
                .replace("&copy;", "©")
                .replace("&reg;", "®")
                .replace("&trade;", "™")
                .replace("&bull;", "•")
                .replace("&hellip;", "…")
                .replace("&prime;", "′")
                .replace("&Prime;", "″")
                .replace("&lsaquo;", "‹")
                .replace("&rsaquo;", "›")
                .replace("&oline;", "‾")
                .replace("&frasl;", "⁄")
                .replace("&larr;", "←")
                .replace("&uarr;", "↑")
                .replace("&rarr;", "→")
                .replace("&darr;", "↓")
                .replace("&harr;", "↔")
                .replace("&crarr;", "↵")
                .replace("&lceil;", "⌈")
                .replace("&rceil;", "⌉")
                .replace("&lfloor;", "⌊")
                .replace("&rfloor;", "⌋")
                .replace("&loz;", "◊")
                .replace("&spades;", "♠")
                .replace("&clubs;", "♣")
                .replace("&hearts;", "♥")
                .replace("&diams;", "♦")
                .replace("&#39;", "'") 
                .replace("&#160;", " ")
                // Add any additional replacements as needed
                ;
        }
        
    
        private boolean isSystemClass(Class<?> clazz) {
            return clazz.isPrimitive() ||
                    clazz.getName().startsWith("java.") ||
                    clazz.getName().startsWith("javax.") ||
                    clazz.getName().startsWith("android.") ||
                    clazz.getName().startsWith("com.sun.");
        }

          public MultipartFile sanitizeFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is null or empty");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit");
        }

        // Verify content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Allowed types: " + String.join(", ", ALLOWED_IMAGE_TYPES));
        }

        // Read file bytes
        byte[] content = file.getBytes();
        
        // Verify file signature (magic numbers)
        if (!isValidImageContent(content)) {
            throw new IllegalArgumentException("File content does not match declared type");
        }

        // Create a new MultipartFile with validated content
        return new SanitizedMultipartFile(
            file.getName(),
            file.getOriginalFilename(),
            file.getContentType(),
            content
        );
    }
    
    
    }

    
}