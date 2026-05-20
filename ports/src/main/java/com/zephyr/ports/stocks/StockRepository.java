package com.zephyr.ports.stocks;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface StockRepository  extends JpaRepository<Stock,Long>, JpaSpecificationExecutor<Stock>, StockDataRepositoryCustom{
    @Query("SELECT s.lastPrice FROM Stock s WHERE s.ticker = ?1")
    Double findPriceBySymbol(String symbol);

    @Query("SELECT s FROM Stock s WHERE s.ticker = ?1")
    Stock findStockBySymbol(String symbol);

    @Query("SELECT s FROM Stock s ORDER BY change DESC LIMIT 5")
    List<Stock> gettop5();
    
    @Query("SELECT s FROM Stock s WHERE s.ticker ILIKE ?1% OR s.fullName ILIKE ?1% ORDER BY s.volume DESC")
    Page<Stock> findAllStockss(String searchQuery, Pageable pageable);

    @Query("SELECT s FROM Stock s")
    List<Stock> findAllStocks();



    String stringQuery = "";

}
