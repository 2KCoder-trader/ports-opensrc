package com.zephyr.ports.stocks;

import java.time.ZonedDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.Predicate;

@Service
public class StockService {
    private static final Logger logger = LoggerFactory.getLogger(StockService.class);
    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private StockDataRepository stockDataRepository;

    @Autowired
    @Qualifier("stockDataRepositoryCustomImpl")
    private StockDataRepositoryCustom stockDataRepositoryCustom;

    @Autowired
    private MarketStatusRepository marketStatusRepository;

    @PersistenceContext
    public EntityManager entityManager;

    public Page<Stock> getAllStocks(String searchQuery, String sortBy, String sortDirection, int pageNumber, String searchType) {
        Sort.Direction direction;
        logger.debug("searchType: {}", searchType);
        direction = "desc".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(pageNumber, 20, Sort.by(direction, sortBy));
        Specification<Stock> specification = (root, query, criteriaBuilder) -> {
            Predicate searchPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get(searchType)), searchQuery.toLowerCase() + "%");
    
    
            // Combine all predicates
            return criteriaBuilder.and(searchPredicate);
        };
    
        return stockRepository.findAll(specification, pageable);

    }

    public Double getPrices(String symbol) {
        return stockRepository.findPriceBySymbol(symbol);
    }

    public Stock getStock(String symbol) {
        return stockRepository.findStockBySymbol(symbol);
    }

    public List<StockData> getStockData(String ticker) {

        return stockDataRepository.getStockData(ticker);
    }
    public MarketStatus getMarketStatus() {
        return marketStatusRepository.getMarketStatus();
    }
    public ZonedDateTime getMarketOpenDateTime() {
        // logger.debug("hi open {}",marketStatusRepository.getMarketStartDate());
        return marketStatusRepository.getMarketStartDate().get(0);
    }
    public ZonedDateTime getMarketCloseDateTime() {
        return marketStatusRepository.getMarketEndDate();
    }

    public List<Object[]> getStocksDataCustom(List<String> tickers){
        return stockDataRepositoryCustom.findDynamicStockPrices(tickers);
    }

    public List<Stock> gettop5() {
        return stockRepository.gettop5();
    }

    public List<Stock> getStocks() {
        return stockRepository.findAllStocks();
    }

    public void saveAllStocks(List<Stock> stocks) {
        stockRepository.saveAll(stocks);
    }

    public void saveAllStockData(List<StockData> stockData) {
        stockDataRepository.saveAll(stockData);
    }
   
}