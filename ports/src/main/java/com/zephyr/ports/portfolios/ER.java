
package com.zephyr.ports.portfolios;

import java.util.*;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.beans.factory.annotation.Autowired;
import org.apache.commons.math3.stat.regression.OLSMultipleLinearRegression;
import org.apache.commons.math3.linear.RealVector;
import org.springframework.stereotype.Component;
import com.zephyr.ports.stocks.StockController;
import com.zephyr.ports.stocks.StockData;

import java.text.SimpleDateFormat;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

@Component
public class ER {

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
public double getExpenseRatio(List<String> tickers, List<Double> shares, double risk) throws Exception{
    List<Double> tradingCostPerShare = new ArrayList<>();
    for(String ticker : tickers){
        tradingCostPerShare.add(0.2);
    }
    Map<String, List<String[]>> symsMap = new HashMap<>();
    
        for (String ticker : tickers) {
            List<String[]> stockData = get_data(ticker);
            symsMap.put(ticker, stockData);
        }
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
        for (int t = 0 ; t < tickers.size(); t++) {
            List<Double> tickPrices = new ArrayList<>();
            for (String[] datePrice : mapDatePrices) {
                tickPrices.add(Double.parseDouble(datePrice[t + 1]));
            }
            stockydata.put(tickers.get(t), tickPrices);
        }
        double risknum = risk;
        double managementFeeRate = 0.03 - (0.02 / 100) * risknum;
        
        // Initialize prices list
        List<Double> prices = new ArrayList<>();
        for (String stock : tickers) {
            List<Double> stockData = stockydata.get(stock);
            prices.add(stockData.get(0));
        }

        // Calculate total assets under management (AUM)
        double totalAum = 0;
        for (int i = 0; i < shares.size(); i++) {
            totalAum += shares.get(i) * prices.get(i);
        }

        // Calculate total management expense
        double totalManagementExpense = totalAum * managementFeeRate;
        
        // Calculate total trading costs
        double totalTradingCosts = 0;
        for (int i = 0; i < shares.size(); i++) {
            totalTradingCosts += shares.get(i) * tradingCostPerShare.get(i);
        }
        
        // Calculate total expenses and expense ratio
        double totalExpenses = totalManagementExpense + totalTradingCosts;
        double expenseRatio = (totalExpenses / totalAum) * 100;

        // Calculate normalized expense ratio using sigmoid function
        double sigmoidValue = 1 / (1 + Math.exp(-Math.abs(expenseRatio))) - 0.5;
        double normalizedExpenseRatio = sigmoidValue * 2;

        // Print and return the result
        return normalizedExpenseRatio;
    

}

}