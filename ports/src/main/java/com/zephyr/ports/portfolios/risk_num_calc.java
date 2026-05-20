package com.zephyr.ports.portfolios;

import java.util.*;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.beans.factory.annotation.Autowired;
import org.apache.commons.math3.stat.regression.OLSMultipleLinearRegression;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
public class risk_num_calc extends OLSMultipleLinearRegression{

    private static final Logger logger = LoggerFactory.getLogger(risk_num_calc.class);


    @Autowired
    private StockController stockController;


    public static double[] convertStringToDoubleArray(String str) {
        // Remove the curly braces
        str = str.replace("{", "").replace("}", "");
        
        // Split the string by semicolon
        String[] stringArray = str.split(";");
        
        // Create a double array to hold the parsed values
        double[] doubleArray = new double[stringArray.length];
        
        // Parse each substring to a double and store it in the double array
        for (int i = 0; i < stringArray.length; i++) {
            doubleArray[i] = Double.parseDouble(stringArray[i].trim());
        }
        
        return doubleArray;
    }

    public static double betalr(List<Double> x, List<Double> y) {
        int n = x.size();

        double[][] xWithIntercept = new double[n][2];
        
        double[] yArray = new double[n];

        for (int i = 0; i < n; i++) {
            xWithIntercept[i][0] = i; // Intercept term
            xWithIntercept[i][1] = x.get(i);
            yArray[i] = y.get(i);
        }
        double meanX = x.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double varianceX = x.stream().mapToDouble(val -> Math.pow(val - meanX, 2)).sum() / (n - 1);
        if (varianceX == 0) {
            throw new IllegalArgumentException("Multicollinearity detected: x values are constant");
        }
        OLSMultipleLinearRegression regression = new OLSMultipleLinearRegression();
        regression.newSampleData(yArray, xWithIntercept);
        double[] coefficients = regression.estimateRegressionParameters();
        return coefficients[2];

        
         // Return the slope coefficient
    }

    public static double calculateCovariance(List<Double> stockData, List<Double> marketData) {
        double meanStock = stockData.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double meanMarket = marketData.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

        double covariance = 0.0;
        for (int i = 0; i < stockData.size(); i++) {
            covariance += (stockData.get(i) - meanStock) * (marketData.get(i) - meanMarket);
        }
        return covariance / (stockData.size() - 1);
    }

    public static double calculateVariance(List<Double> data) {
        double mean = data.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

        double variance = 0.0;
        for (double value : data) {
            variance += Math.pow(value - mean, 2);
        }
        return variance / (data.size() - 1);
    }

    public static double betacov(List<Double> stockData, List<Double> marketData) {
        List<Double> stockDataSubList = stockData.subList(1, stockData.size());
        List<Double> marketDataSubList = marketData.subList(1, marketData.size());

        double covariance = calculateCovariance(stockDataSubList, marketDataSubList);
        double variance = calculateVariance(marketDataSubList);

        return covariance / variance;
    }

    public static double round(double value, int places) {
        if (places < 0)
            throw new IllegalArgumentException();

        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }

    public List<Map<String, String>> get_data(String ticker) {
        List<StockData> data = stockController.getStockData(ticker);
        
        List<Map<String, String>> dataList = new ArrayList<>();

        for (StockData node : data) {
            Map<String, String> map = new HashMap<>();
            map.put("date", node.getTimestamp().toString());
            map.put("close", node.getPrice() + "");
            dataList.add(map);
        }
        // Collections.reverse(dataList);
        return dataList;

    }

    public static List<Double> calculatePercentageChange(List<Double> stockPrices) {
        List<Double> pctChange = new ArrayList<>();
        for (int i = 1; i < stockPrices.size(); i++) {
            double change = (stockPrices.get(i) - stockPrices.get(i - 1)) / stockPrices.get(i - 1);
            pctChange.add(change);
        }
        return pctChange;
    }

    public static double[] getWMean(List<Double> stocknums, List<Double> stockprices, List<Double> finalbetas) {
        int n = stocknums.size();
        double[] stocknumsArray = stocknums.stream().mapToDouble(Double::doubleValue).toArray();
        double[] stockpricesArray = stockprices.stream().mapToDouble(Double::doubleValue).toArray();
        double[] finalbetasArray = finalbetas.stream().mapToDouble(Double::doubleValue).toArray();

        double[] weights = new double[n];
        double totalWeight = 0.0;
        for (int i = 0; i < n; i++) {
            weights[i] = stocknumsArray[i] * stockpricesArray[i];
            totalWeight += weights[i];
        }

        double weightedAvg = 0.0;
        for (int i = 0; i < n; i++) {
            weightedAvg += finalbetasArray[i] * weights[i];
        }
        weightedAvg /= totalWeight;

        double variance = 0.0;
        for (int i = 0; i < n; i++) {
            variance += weights[i] * Math.pow(finalbetasArray[i] - weightedAvg, 2);
        }
        variance /= totalWeight;

        return new double[] { weightedAvg, variance };
    }

    public static double mapToPercentage(double betaValue) {
        // Apply sigmoid transformation
        double sigmoidValue = 1 / (1 + Math.exp(-Math.abs(betaValue))) - 0.5;

        // Scale sigmoid value to percentage (0-100%)
        double percentage = sigmoidValue * 5;

        return percentage;
    }

    public static double calculateRiskNum(double betaofport, double varofport) {
        double riskValue = ((Math.abs(Math.sqrt(varofport) - betaofport) / betaofport) + 1) * betaofport;
        return mapToPercentage(riskValue);
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

    public double getRisk(List<String> tickers, List<Double> shares, String sector) {
        try{
        List<Double> betas = new ArrayList<>();
        List<Double> prices = new ArrayList<>();
        List<Map<String, String>> spyHist = get_data(sector);

        List<String[]> spyMap = new ArrayList<>();
        for (Map<String, String> map : spyHist) {
            spyMap.add(new String[] { map.get("date"), map.get("close") });
        }
        for (String ticker : tickers) {
            List<Map<String, String>> symHist = get_data(ticker);
            List<String[]> symMap = new ArrayList<>();
            for (Map<String, String> map : symHist) {
                symMap.add(new String[] { map.get("date"), map.get("close") });
            }
            // we map them like {date, price, spyprice}
            List<String[]> mapDatePrices = new ArrayList<>();
            Set<String> uniqueDates = new HashSet<>();
            for (int i = 0; i < symMap.size(); i++) {
                for (int j = 0; j < spyMap.size(); j++) {
                    if (symMap.get(i)[0].equals(spyMap.get(j)[0])) {
                        if(uniqueDates.contains(symMap.get(i)[0])) continue;
                        uniqueDates.add(symMap.get(i)[0]);
                        mapDatePrices.add(new String[] {symMap.get(i)[0],  spyMap.get(j)[1], symMap.get(i)[1] });
                    }
                }
            }
            sortByDate(mapDatePrices);
            List<Double> spyPrices = new ArrayList<>();
            List<Double> symPrices = new ArrayList<>();
            for (String[] datePrice : mapDatePrices) {
                spyPrices.add(Double.parseDouble(datePrice[1]));
                symPrices.add(Double.parseDouble(datePrice[2]));
            }
            List<Double> spyPctChange = calculatePercentageChange(spyPrices);
            List<Double> symPctChange = calculatePercentageChange(symPrices);
            if (symPctChange.size() == 0) {
                logger.debug(ticker + " has no data");
                continue;
            }
            double beta1 = betacov(symPctChange, spyPctChange);
            double beta2 = betalr(spyPctChange, symPctChange);
            double finalBeta = (beta1 + beta2) / 2;
            betas.add(finalBeta);
            prices.add(symPrices.get(symPrices.size() - 1));

        }
        double[] wMean = getWMean(shares, prices, betas);
        double betaofport = round(wMean[0], 8);
        double varofport = round(wMean[1], 8);
        double riskNum = calculateRiskNum(betaofport, varofport);
        return round(riskNum, 2);
    } catch (Exception e) {
        e.printStackTrace();

        // Method body
    }
    return 0.0;
}

   
}