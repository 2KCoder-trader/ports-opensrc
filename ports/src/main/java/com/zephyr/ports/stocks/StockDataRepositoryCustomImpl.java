package com.zephyr.ports.stocks;

import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;


import java.util.List;

@Repository
public class StockDataRepositoryCustomImpl implements StockDataRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Object[]> findDynamicStockPrices(List<String> tickers) {
        StringBuilder sqlQuery = new StringBuilder("SELECT timestamp");

        for (String ticker : tickers) {
            sqlQuery.append(", MAX(CASE WHEN ticker = ")
                    .append(ticker)
                    .append(" THEN price END) AS \"")
                    .append(ticker)
                    .append("\"");
        }

        sqlQuery.append(" FROM ports.stock_data GROUP BY timestamp ORDER BY timestamp;");

        Query query = entityManager.createNativeQuery(sqlQuery.toString());
        @SuppressWarnings("unchecked")
        List<Object[]> results = (List<Object[]>) query.getResultList();

        // Convert the results to a list of maps

        return results;
    }
}