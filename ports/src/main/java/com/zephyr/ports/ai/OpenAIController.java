package com.zephyr.ports.ai;

import java.util.Map;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("ports/openai")
public class OpenAIController {
    Logger logger = Logger.getLogger(OpenAIController.class.getName());

    @Autowired
    private final OpenAIService openAIService;

    public OpenAIController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    @PostMapping("/getGeneratedPort")
    public Mono<String> generatePortfolio(@RequestBody Map<String, String> request) {
        try{
        logger.info("Received request: " + request);
        String prompt = request.get("prompt");
        return openAIService.getGeneratedPortfolio(prompt);
        }catch (Exception e){
            logger.severe("Error: " + e.getMessage());
            return Mono.error(new RuntimeException("Error generating portfolio", e));
        }
    }
}

