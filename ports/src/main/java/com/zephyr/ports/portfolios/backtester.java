package com.zephyr.ports.portfolios;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zephyr.ports.stocks.StockController;
import com.zephyr.ports.stocks.StockData;


@Component
public class backtester {

    @Autowired
    private StockController stockController;

    public List<String[]> get_data(String ticker) {
        List<StockData> dataList = stockController.getStockData(ticker);
        List<String[]> tickMap = new ArrayList<>();
        for (StockData map : dataList) {
            tickMap.add(new String[] { map.getTimestamp().toString(), map.getPrice()+"" });
        }
        // Collections.reverse(dataList);
        return tickMap;
    }

    private static void sortByDate(List<String[]> list) throws Exception {
        DateTimeFormatter dateFormat = DateTimeFormatter.ISO_DATE_TIME;
        Collections.sort(list, new Comparator<String[]>() {
            public int compare(String[] a, String[] b) {
                try {
                    ZonedDateTime date1 = ZonedDateTime.parse(a[0], dateFormat);
                    ZonedDateTime date2 = ZonedDateTime.parse(b[0], dateFormat);
                    return date1.compareTo(date2);
                } catch (Exception e) {
                    throw new IllegalArgumentException(e);
                }
            }
        });
    }
    
    public ArrayList<Object> getAnalystValues(List<String> tickers, List<Double> shares) throws Exception{
        List<Integer> lors = new ArrayList<>();
        for (int i = 0; i < tickers.size(); i++) {
                    lors.add(1);
                }
        Map<String, List<String[]>> symsMap = new HashMap<>();
        for (String ticker : tickers) {
            List<String[]> stockData = get_data(ticker);
            symsMap.put(ticker, stockData);
        }

        // double initialInvestment = 100;
        List<Double> dailyPnls = new ArrayList<>();
        List<Double> cumulativePnls = new ArrayList<>();
        
        List<String[]> mapDatePrices = new ArrayList<>();

        for (int i = 0; i < symsMap.get(tickers.get(0)).size(); i++) {

            boolean matchedDate = true;
            String[] datePrices = new String[tickers.size() + 1];
            datePrices[0] = symsMap.get(tickers.get(0)).get(i)[0];
            datePrices[1] = symsMap.get(tickers.get(0)).get(i)[1];
            for (int t = 1 ; t < tickers.size(); t++) {
                boolean found = false;
                String constant_date = symsMap.get(tickers.get(0)).get(i)[0];
                for (int j = 0; j < symsMap.get(tickers.get(t)).size(); j++) {
                    String comparing_date = symsMap.get(tickers.get(t)).get(j)[0];
                    if (constant_date.equals(comparing_date)) {
                        datePrices[t + 1] = symsMap.get(tickers.get(t)).get(j)[1];
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    matchedDate = false;
                    break;
                }
            }
            if (!matchedDate) {
                continue;
            }else{
                mapDatePrices.add(datePrices);
            }
        }
        sortByDate(mapDatePrices);
        Map<String, List<Double>> stockydata = new HashMap<>();
        ArrayList<String> dates = new ArrayList<>();
        for (String[] datePrice : mapDatePrices) {
            dates.add(datePrice[0]);
        }
        for (int t = 0 ; t < tickers.size(); t++) {
            List<Double> tickPrices = new ArrayList<>();
            for (String[] datePrice : mapDatePrices) {
                tickPrices.add(Double.parseDouble(datePrice[t + 1]));
            }
            stockydata.put(tickers.get(t), tickPrices);
        } 

        double initialPortfolioValue = 0;
        for (int j = 0; j < tickers.size(); j++) {
            String ticker = tickers.get(j);
            double stockValue = stockydata.get(ticker).get(0);
            initialPortfolioValue += shares.get(j) * stockValue * (lors.get(j) == 0 ? -1 : 1);
        }
        double initialInvestment = initialPortfolioValue;
        cumulativePnls.add(initialInvestment);

        // Calculate daily portfolio values and cumulative P&L
        for (int i = 1; i < stockydata.get(tickers.get(0)).size(); i++) {
            double dailyPortfolioValue = 0;
            for (int j = 0; j < tickers.size(); j++) {
                String ticker = tickers.get(j);
                double stockValue = stockydata.get(ticker).get(i);
                dailyPortfolioValue += shares.get(j) * stockValue * (lors.get(j) == 0 ? -1 : 1);
            }

            double dailyPnl = dailyPortfolioValue - initialPortfolioValue;
            double dailyPnlPerc = (dailyPortfolioValue - initialPortfolioValue) / initialPortfolioValue;
            dailyPnls.add(dailyPnl);
            cumulativePnls.add(cumulativePnls.get(cumulativePnls.size() - 1) + cumulativePnls.get(cumulativePnls.size() - 1) * dailyPnlPerc);
            initialPortfolioValue = dailyPortfolioValue;
        }

        // Convert cumulativePnls to array
        double[] portfolioValues = cumulativePnls.stream().mapToDouble(d -> d).toArray();
        // Calculate daily returns
        double[] dailyReturns = new double[portfolioValues.length - 1];
        for (int i = 1; i < portfolioValues.length; i++) {
            dailyReturns[i - 1] = (portfolioValues[i] - portfolioValues[i - 1]) / portfolioValues[i - 1];
        }

        // Calculate annualized return
        double annret = ((cumulativePnls.get(cumulativePnls.size() - 1) - initialInvestment) / initialInvestment) / 2;
        double monthret = annret / 12;

        // Calculate maximum drawdown
        double runningMax = Double.NEGATIVE_INFINITY;
        double maxDrawdown = 0;
        for (double value : portfolioValues) {
            if (value > runningMax) {
                runningMax = value;
            }
            double drawdown = (value - runningMax) / runningMax;
            if (drawdown < maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }

        // Calculate Sharpe ratio (assuming risk-free rate is 0)
        double meanDailyReturn = 0;
        double stdDevDailyReturn = 0;
        if (dailyReturns.length > 0) {
            for (double r : dailyReturns) {
                meanDailyReturn += r;
            }
            meanDailyReturn /= dailyReturns.length;

            for (double r : dailyReturns) {
                stdDevDailyReturn += Math.pow(r - meanDailyReturn, 2);
            }
            stdDevDailyReturn = Math.sqrt(stdDevDailyReturn / dailyReturns.length);
        }
        double sharpeRatio = meanDailyReturn / stdDevDailyReturn * Math.sqrt(252);


        return new ArrayList<>(Arrays.asList(annret * 100, monthret * 100, Math.abs(maxDrawdown) * 100, sharpeRatio, cumulativePnls, dates));
    
}
}
