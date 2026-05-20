package com.zephyr.ports.portfolios;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class TokenManager {

    private static final OkHttpClient client = new OkHttpClient();
    private static final MediaType FORM = MediaType.parse("application/x-www-form-urlencoded");

    public static Map<String, String> headers() throws IOException {
        String scriptDirectory = Paths.get("").toAbsolutePath().toString();
        File file = new File(scriptDirectory + "/access_token.csv");
        BufferedReader br = new BufferedReader(new FileReader(file));
        String token = br.readLine().split(",")[1]; // Assuming the token is in the second column
        br.close();

        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer " + token);
        return headers;
    }

    public static void resetKey() throws IOException {
        File secretsFile = new File("secrets.csv");
        BufferedReader br = new BufferedReader(new FileReader(secretsFile));

        String[] secrets = br.readLine().split(","); // Assuming secrets are in the first line
        String CLIENT_ID = secrets[0];
        String CLIENT_SECRET = secrets[1];
        String REFRESH_TOKEN = secrets[2];
        br.close();
        String url = "https://signin.tradestation.com/oauth/token";
        String payload = "grant_type=refresh_token&client_id=" + CLIENT_ID + 
                         "&client_secret=" + CLIENT_SECRET + 
                         "&refresh_token=" + REFRESH_TOKEN;

        RequestBody body = RequestBody.create(payload, FORM);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .addHeader("Content-Type", "application/x-www-form-urlencoded")
                .build();

        Response response = client.newCall(request).execute();
        String responseData = response.body().string();
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode json = objectMapper.readTree(responseData);
        System.out.println(json.toString());
        String token = json.get("access_token").asText();
        try (FileWriter fw = new FileWriter("access_token.csv")) {
            fw.write("token," + token);
        }
    }
 

}
