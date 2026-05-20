package com.zephyr.ports.stocks;

import java.util.List;
import java.util.Map;

public interface StockDataRepositoryCustom {
    List<Object[]>  findDynamicStockPrices(List<String> tickers);
}