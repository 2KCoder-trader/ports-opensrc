package com.zephyr.ports.news;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.zephyr.ports.portfolios.Portfolio;
import com.zephyr.ports.investment.InvestmentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zephyr.ports.investment.Investment;
import com.zephyr.ports.portfolios.PortfolioRepository;
import jakarta.persistence.criteria.CriteriaBuilder.In;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class newservice {
    @Autowired
    private final newsrepository repository;
    private final RestTemplate restTemplate;
    private final String apiKey = System.getenv().getOrDefault("ALPHAVANTAGE_API_KEY", "");
    private final ObjectMapper objectMapper;
    
    public newservice(newsrepository repository) {
        this.repository = repository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    @Scheduled(fixedRate = 8000000) 
    public void fetchAndSaveNewsSentiment() {
        try {
            String url = String.format("https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&apikey=%s", apiKey);
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            String jsonResponse = response.getBody();
            
            // Manually parse the JSON to handle nested structure
            Map<String, Object> responseMap = objectMapper.readValue(jsonResponse, Map.class);
            List<Map<String, Object>> feed = (List<Map<String, Object>>) responseMap.get("feed");
            
            if (feed != null) {
                List<news> newsItems = feed.stream()
                    .map(item -> objectMapper.convertValue(item, news.class))
                    .collect(Collectors.toList());
                
                repository.saveAll(newsItems);
             System.out.println( newsItems.size());
            }
        } catch (Exception e) {
          System.out.println(e.getMessage());
        }
    }
    
}