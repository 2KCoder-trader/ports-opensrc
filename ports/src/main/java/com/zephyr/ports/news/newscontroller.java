package com.zephyr.ports.news;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zephyr.ports.Auth.EncryptionUtil;
import com.zephyr.ports.portfolios.Portfolio;

@RestController
@RequestMapping("ports/News")
public class newscontroller {

        @Autowired
        newsrepository newsrepository;

        @GetMapping("/getnews")
    public List<news> getNews() throws Exception {
            List<news> allNews = newsrepository.findAll();

            return allNews;
        
    }
}
