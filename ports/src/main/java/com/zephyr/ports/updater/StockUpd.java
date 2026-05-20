package com.zephyr.ports.updater;

import java.io.IOException;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zephyr.ports.stocks.MarketStatus;
import com.zephyr.ports.stocks.Stock;
import com.zephyr.ports.stocks.StockController;
import com.zephyr.ports.stocks.StockData;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;




@RestController
public class StockUpd {

    private static final Logger logger = LoggerFactory.getLogger(StockUpd.class);


    private String JohnsClientID = System.getenv().getOrDefault("TS_JOHN_CLIENT_ID", "");
    private String JohnsClientSecret = System.getenv().getOrDefault("TS_JOHN_CLIENT_SECRET", "");
    private String JohnsRefreshToken = System.getenv().getOrDefault("TS_JOHN_REFRESH_TOKEN", "");
    private String JohnsAccessToken = "";
    private String KaidensClientID = System.getenv().getOrDefault("TS_KAIDEN_CLIENT_ID", "");
    private String KaidensClientSecret = System.getenv().getOrDefault("TS_KAIDEN_CLIENT_SECRET", "");
    private String KaidensRefreshToken = System.getenv().getOrDefault("TS_KAIDEN_REFRESH_TOKEN", "");
    private String KaidensAccessToken = "";
    private String url = "https://signin.tradestation.com/oauth/token";
    private static final OkHttpClient client = new OkHttpClient();
    private static final MediaType FORM = MediaType.parse("application/x-www-form-urlencoded");

    @Autowired
    private StockController stockController;





    private String getAccessToken(String clientID, String clientSecret, String refreshToken) throws IOException{
        String payload;
        payload = "grant_type=refresh_token&client_id=" + clientID + 
                "&client_secret=" + clientSecret +
                "&refresh_token=" + refreshToken;

        RequestBody body = RequestBody.create(payload, FORM);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .addHeader("Content-Type", "application/x-www-form-urlencoded")
                .build();

        Response response = client.newCall(request).execute();
        String responseData = response.body().string();
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode json = objectMapper.readTree(responseData);
        return json.get("access_token").asText();
    }
    @Value("${scheduled.enabled}")
    private boolean scheduledEnabled;

    private boolean isSchedulingEnabled() {
        return scheduledEnabled;
    }
    @Scheduled(fixedRate = 1140000)
    public void updateTokens() throws IOException {
        if (!isSchedulingEnabled()) {
            return; // Skip execution if scheduling is disabled
        }
        logger.debug("Updating tokens");
        JohnsAccessToken = getAccessToken(JohnsClientID, JohnsClientSecret, JohnsRefreshToken);
        KaidensAccessToken = getAccessToken(KaidensClientID, KaidensClientSecret, KaidensRefreshToken);
    }



    @Scheduled(fixedDelay = 60000)
    public void updatingStocks(){
        if (!isSchedulingEnabled()) {
            return; // Skip execution if scheduling is disabled
        }
        MarketStatus marketdata = stockController.getMarketStatusData();
        if (JohnsAccessToken.equals("") || KaidensAccessToken.equals("")){
            System.out.println("Access tokens not updated");
            return;
        }
    if (!marketdata.isMarketOpen()) {
        return;
    }
    List<Stock> tickers = stockController.getStocks();
    List<Map<String, Stock>> groups = groupsOf100(tickers);
    
    ExecutorService executor = Executors.newFixedThreadPool(10);
    for (int i = 0; i < groups.size(); i++) {
        final int index = i;
        Map<String, Stock> group = groups.get(i);
        executor.submit(() -> {
            try {
                updateStocks(group, index);
            } catch (Exception e) {
                System.out.println("Error updating stocks");
            }
        });
    }
    executor.shutdown();
        
    }

    @Scheduled(fixedRate = 36000000)
    public void updatingStockData(){
        if (!isSchedulingEnabled()) {
            return; // Skip execution if scheduling is disabled
        }
        MarketStatus marketdata = stockController.getMarketStatusData();

        ZonedDateTime hourPostClose = marketdata.getCloseDate().plusHours(1);

        ZonedDateTime now = ZonedDateTime.now();

        if (now.isAfter(hourPostClose)){
            return;
        }

        if (now.isBefore(marketdata.getCloseDate())){
            return;
        }


        if (JohnsAccessToken == null || KaidensAccessToken == null){
            System.out.println("Access tokens not updated");
            return;
        }
    List<Stock> tickers = stockController.getStocks();
    List<Map<String,Stock>> groups = groupsOf100(tickers);

    

    ExecutorService executor = Executors.newFixedThreadPool(10);
    for (int i = 0; i < groups.size(); i++) {
        final int index = i;
        Map<String,Stock> group = groups.get(i);
        executor.submit(() -> {
            try {
                updateStockData(group, index, marketdata.getCloseDate());
            } catch (Exception e) {
                System.out.println("Error updating stocks");
            }
        });
    }
    executor.shutdown();
    

    }



    private void updateStocks(Map<String,Stock> tickers, int i) throws IOException {
        try{
        ArrayList<Stock> stocks = new ArrayList<>();
        String url;
            url = "https://api.tradestation.com/v3/marketdata/quotes/" +
                    tickers.keySet().stream().collect(Collectors.joining(","));
        Request request = new Request.Builder()
                .url(url)
                .get()
                .addHeader("Authorization", "Bearer " + (i % 2 == 0 ? JohnsAccessToken : KaidensAccessToken))
                .build();
        Response response = client.newCall(request).execute();
        String responseData = response.body().string();
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode json = objectMapper.readTree(responseData);
        JsonNode quotes  = json.get("Quotes");
        for(int j = quotes.size()-1; j > -1 ; j--){
            JsonNode quote = quotes.get(j);
            Stock stock = tickers.get(quote.get("Symbol").asText());
            double lastPrice = Double.parseDouble(quote.get("Last").asText());
            double change = Double.parseDouble(quote.get("NetChange").asText());
            int volume = quote.get("Volume").asInt();
            stock.setLastPrice(lastPrice);
            stock.setChange(change);
            stock.setVolume(volume);
            stocks.add(stock);
        }
        // stockController.saveAllStocks(stocks);
        // logger.debug("Stock data updated {} {}", stocks.size(),stocks.get(0));
        } catch (Exception e){
            logger.error("Error updating stocks", e);
        }

    }



    private void updateStockData(Map<String,Stock> tickers, int i, ZonedDateTime close) throws IOException {
        ArrayList<StockData> stockDatas = new ArrayList<>();
        String url;
            url = "https://api.tradestation.com/v3/marketdata/quotes/" +
                    tickers.keySet().stream().collect(Collectors.joining(","));
        Request request = new Request.Builder()
                .url(url)
                .get()
                .addHeader("Authorization", "Bearer " + (i % 2 == 0 ? JohnsAccessToken : KaidensAccessToken))
                .build();
        Response response = client.newCall(request).execute();
        String responseData = response.body().string();
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode json = objectMapper.readTree(responseData);
        JsonNode quotes  = json.get("Quotes");
        for (JsonNode quote : quotes){
            StockData stockData = new StockData();
            String ticker = quote.get("Symbol").asText();
            double lastPrice = Double.parseDouble(quote.get("Last").asText());
            stockData.setTicker(ticker);
            stockData.setPrice(lastPrice);
            stockData.setTimestamp(close);
            stockDatas.add(stockData);
        }
        stockController.saveAllStockData(stockDatas);
        // logger.debug("Stock data updated {} {}", stockDatas.size(),stockDatas.get(0));

    }

    
        
    // stocks, commodities, options, forex, crypto, nfts, bonds, mutual funds, etfs, 


    private List<Map<String, Stock>> groupsOf100(List<Stock> tickers){
        int size = tickers.size();
        List<Map<String, Stock>> groups = new ArrayList<>((size + 99) / 100); // Preallocate capacity
        
        for (int i = 0; i < size; i += 100) {
            List<Stock> subTickers = tickers.subList(i, Math.min(i + 100, size));
            groups.add(subTickers.stream().collect(Collectors.toMap(Stock::getTicker, stock -> stock)));
        }
        
        return groups;
        
    }



    
}
