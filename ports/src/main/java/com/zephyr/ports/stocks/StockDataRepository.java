package com.zephyr.ports.stocks;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



import org.springframework.data.jpa.repository.Query;

@Repository
public interface StockDataRepository extends JpaRepository<StockData,Long> {



@Query("SELECT sd FROM StockData sd WHERE sd.ticker = ?1 ORDER BY sd.timestamp DESC")
List<StockData> getStockData(String ticker);






}