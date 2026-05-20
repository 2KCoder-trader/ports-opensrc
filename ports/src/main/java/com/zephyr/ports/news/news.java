package com.zephyr.ports.news;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import lombok.*;



@Entity
@Table(name = "news_sentiment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class news {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String time;
    private String source;
    
    @Column(columnDefinition = "TEXT")
    private String headline;
    private Integer sentiment;
    
    @JsonProperty("time_published")
    private String timePublished;
    
    @JsonProperty("source")
    public void setSourceUpperCase(String source) {
        this.source = source.toUpperCase();
    }
    
    @JsonProperty("title")
    public void setHeadline(String title) {
        this.headline = title;
    }
    
    @JsonProperty("overall_sentiment_label")
    public void setSentimentFromLabel(String label) {
        Map<String, Integer> sentimentMap = Map.of(
            "Somewhat-Bullish", 1,
            "Bullish", 1,
            "Somewhat-Bearish", -1,
            "Bearish", -1,
            "Neutral", 0
        );
        this.sentiment = sentimentMap.getOrDefault(label, 0);
    }
    
    @PostLoad
    @PostPersist
    public void formatTime() {
        if (timePublished != null && timePublished.length() >= 12) {
            String hour = timePublished.substring(8, 10);
            String minute = timePublished.substring(10, 12);
            this.time = hour + ":" + minute;
        }
    }
}