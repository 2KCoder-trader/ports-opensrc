package com.zephyr.ports.Auth;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Component;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.io.ByteArrayOutputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;


@Component
public class EncryptionUtil {
    
    private static final String ALGORITHM = "AES";
    private static final String SECRET_KEY = System.getenv().getOrDefault("ENCRYPTION_SECRET_KEY", "");


     private static final ObjectMapper objectMapper = new ObjectMapper();

     static {
        objectMapper.registerModule(new JavaTimeModule());
    }


     public static String encryptFields(Object obj) throws Exception {
        if (obj == null) {
            return null;
        }

        // If the object is already a Map, process it directly
        if (obj instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) obj;
            Map<String, String> encryptedFields = new HashMap<>();
            
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                String key = entry.getKey().toString();
                Object value = entry.getValue();
                
                if (value != null) {
                    String stringValue = (value instanceof String) 
                        ? (String) value 
                        : objectMapper.writeValueAsString(value);
                    
                    String encryptedValue = encrypts(stringValue);
                    encryptedFields.put(key, encryptedValue);
                }
            }
            
            return objectMapper.writeValueAsString(encryptedFields);
        }

        // For non-Map objects, serialize to Map first
        Map<String, Object> map = objectMapper.convertValue(obj, Map.class);
        Map<String, String> encryptedFields = new HashMap<>();
        
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            Object value = entry.getValue();
            if (value != null) {
                String stringValue = (value instanceof String) 
                    ? (String) value 
                    : objectMapper.writeValueAsString(value);
                
                String encryptedValue = encrypts(stringValue);
                encryptedFields.put(entry.getKey(), encryptedValue);
            }
        }
        
        return objectMapper.writeValueAsString(encryptedFields);
    }
    //  public static String encryptFields(Object obj) throws Exception {
    //     if (obj == null) {
    //         return null;
    //     }
    
    //     Map<String, String> encryptedFields = new HashMap<>();
    
    //     // Get all fields including private ones
    //     Field[] fields = obj.getClass().getDeclaredFields();
    
    //     for (Field field : fields) {
    //         // Skip static fields
    //         if (Modifier.isStatic(field.getModifiers())) {
    //             continue;
    //         }
    
    //         // Allow access to private fields if not static
    //         field.setAccessible(true);
    //         Object value = field.get(obj);
    
    //         if (value != null) {
    //             // Convert the field value to string
    //             String stringValue;
    //             if (value instanceof String) {
    //                 stringValue = (String) value;
    //             } else {
    //                 stringValue = objectMapper.writeValueAsString(value);
    //             }
    
    //             // Encrypt the field value
    //             String encryptedValue = encrypts(stringValue);
    //             encryptedFields.put(field.getName(), encryptedValue);
    //         }
    //     }
    
    //     // Convert the map to JSON string
    //     return objectMapper.writeValueAsString(encryptedFields);
    // }

    private static String encrypts(String data) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(SECRET_KEY.getBytes("UTF-8"), "AES");
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, keySpec);
        
        byte[] encryptedBytes = cipher.doFinal(data.getBytes("UTF-8"));
        return Base64.getEncoder().encodeToString(encryptedBytes);
    }
    

    public static String encrypt(Object data) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(SECRET_KEY.getBytes("UTF-8"), ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, keySpec);

        byte[] dataBytes;
        
        if (data instanceof String) {
            dataBytes = ((String) data).getBytes("UTF-8");
        } else if (data instanceof Serializable) {
            ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
            ObjectOutputStream objectStream = new ObjectOutputStream(byteStream);
            objectStream.writeObject(data);
            objectStream.close();
            dataBytes = byteStream.toByteArray();
        } else {
            throw new IllegalArgumentException("Data must be a String or Serializable object.");
        }

        byte[] encryptedBytes = cipher.doFinal(dataBytes);
        return Base64.getEncoder().encodeToString(encryptedBytes);
    }
    public static String decrypt(String encryptedData) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(SECRET_KEY.getBytes(), ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, keySpec);
        byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
        return new String(decryptedBytes);
    }
}
