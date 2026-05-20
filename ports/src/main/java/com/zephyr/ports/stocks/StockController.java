package com.zephyr.ports.stocks;


import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.zephyr.ports.SecurityConfiguration.HtmlSanitizer;
import com.zephyr.ports.Auth.EncryptionUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.MessageFormat;

import org.springframework.data.domain.Page;
import com.zephyr.ports.stocks.Stock;

@RestController
@RequestMapping("ports/stocks")
public class StockController {
    private static final Logger logger = LoggerFactory.getLogger(StockController.class);
    @Autowired
    private HtmlSanitizer htmlSanitizer;
    @Autowired
    private  StockService stockService;
    

    @GetMapping("/getStocks")
 public String getStocks(@RequestParam String searchQuery, @RequestParam(defaultValue = "volume") String sortBy, @RequestParam(defaultValue = "desc") String sortDirection, @RequestParam(defaultValue = "0") int pageNumber, @RequestParam(defaultValue = "ticker") String searchType) throws Exception {
        searchQuery = htmlSanitizer.sanitize(searchQuery);
        sortBy = htmlSanitizer.sanitize(sortBy);
        sortDirection = htmlSanitizer.sanitize(sortDirection);

        Page<Stock> stocks = stockService.getAllStocks( searchQuery, sortBy, sortDirection, pageNumber,searchType);

        return EncryptionUtil.encryptFields(stocks);
    }

    public List<Object[]> getStocksDataCustom(List<String> tickers) {
  
        return stockService.getStocksDataCustom(tickers);
    }

    @GetMapping("/getTop5") 
    public  List<Stock> getTop5() throws Exception {

        return stockService.gettop5();
    }

    @GetMapping("/getPrices")
    public List<Double> getPrices(@RequestParam List<String> symbols)  {

        symbols = htmlSanitizer.sanitize(symbols);
        logger.debug("Getting symbol price {}", symbols);
        List<Double> prices  = new ArrayList<>();
        for (String symbol : symbols) {
            logger.debug("Getting symbol price {}", symbol);
            try{
            prices.add(stockService.getPrices(symbol));
            } catch (Exception e) {
                logger.error("Error getting price for symbol {}", symbol);
            }
            logger.debug("Getting prices {}", prices);
        }
        logger.debug("Final prices {}", prices);
        
        return prices;
    }


    public Stock getStock(String ticker) {
        ticker = htmlSanitizer.sanitize(ticker);
        return stockService.getStock(ticker);
    }

    public List<StockData> getStockData(String ticker) {
        ticker = htmlSanitizer.sanitize(ticker);
        return stockService.getStockData(ticker);
    }



    public MarketStatus getMarketStatusData() {
        return stockService.getMarketStatus();
    }
    
    public List<Stock> getStocks() {
        return stockService.getStocks();
    }
    @GetMapping("/getAllStocks")
    public String getAllStockMap() throws Exception {
        List<Stock> stocks = stockService.getStocks();
        Map<String, List<Stock>> stockMap = new HashMap<>();
        stockMap.put("stocks", stocks);
        return EncryptionUtil.encryptFields(stockMap);

    }


    public void saveAllStocks(List<Stock> stocks) {
        stockService.saveAllStocks(stocks);
    }

    public void saveAllStockData(List<StockData> stockData) {
        stockService.saveAllStockData(stockData);
    }



    
}