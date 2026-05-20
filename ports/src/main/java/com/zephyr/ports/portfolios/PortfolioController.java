package com.zephyr.ports.portfolios;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import javax.sound.sampled.Port;

import java.util.Set;

import org.checkerframework.checker.units.qual.A;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zephyr.ports.Auth.EncryptionUtil;
import com.zephyr.ports.activity.ActivityService;
import com.zephyr.ports.investment.Investment;
import com.zephyr.ports.investment.InvestmentController;
import com.zephyr.ports.stocks.MarketStatus;
import com.zephyr.ports.stocks.Stock;
import com.zephyr.ports.stocks.StockController;
import com.zephyr.ports.users.UserController;
import com.zephyr.ports.users.users;
import com.zephyr.ports.updater.PortfolioUpd;
import com.zephyr.ports.updater.StockUpd;


@RestController
@RequestMapping("ports/Portfolio")
public class PortfolioController {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioController.class);




    @Autowired

    private final PortfolioService portfolioService;
    @Autowired
    private final StockController stockController;
    @Autowired
    private final UserController userController;
    @Autowired
    private final InvestmentController investmentController;

    @Autowired
    private final risk_num_calc risk_num_calc;

    @Autowired
    private final backtester backtester;

    @Autowired
    private final ER ER;






    private final Map<String, String> sectorTickerMap = new HashMap<String, String>() {
        {
            put("Communication", "XLC");
            put("Consumer Discretionary", "XLY");
            put("Consumer Staples", "XLP");
            put("Energy", "XLE");
            put("Financials", "XLF");
            put("Health Care", "XLV");
            put("Industrials", "XLI");
            put("Materials", "XLB");
            put("Real Estate", "XLRE");
            put("Technology", "XLK");
            put("Utilities", "XLU");
            put("General", "SPY");

        }
    };

    @Autowired
    private final buy_stock buy_stock;

    @Autowired
    private final ActivityService activityService;


    // @PostMapping("/savePortfolio")
    // public ResponseEntity<Portfolio> savePortfolio(@RequestBody Portfolio
    // Portfolio) {
    // Portfolio newPortfolio = Portfolioervice.save(Portfolio);
    // return ResponseEntity.ok(newPortfolio);
    // }
    public record PortfolioChartData(List<ZonedDateTime> dateHist, List<Double> valueHist) {
    }

    public PortfolioController(PortfolioService portfolioService,
            StockController stockController,
            UserController userController,
            InvestmentController investmentController,
            risk_num_calc risk_num_calc,
            backtester backtester,
            ER ER,
            buy_stock buy_stock,
            ActivityService activityService
            ) {
            
        this.portfolioService = portfolioService;
        this.stockController = stockController;
        this.userController = userController;
        this.investmentController = investmentController;
        this.risk_num_calc = risk_num_calc;
        this.backtester = backtester;
        this.ER = ER;
        this.buy_stock = buy_stock;
        this.activityService = activityService;

        //

    }


    // @PostConstruct
    // public void init() throws Exception {
    //     updatePortfoliosDaily();
    //     userController.updateUserDaily();

    // }


    // @GetMapping("/getId")
    // public Portfolio getPortfolioById(@RequestParam Long portfolioId) {
    // logger.debug("Getting Portfolio by ID: {}", portfolioId);
    // return Portfolioervice.getPortfolioByIdd(portfolioId);
    // }




    @PostMapping("/setToPublic")
    public String setToPublic(@RequestParam Long portId) {
        Portfolio port = portfolioService.getPortfolioByIdd(portId);
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("America/New_York"));
        port.setPublishDate(now);
        port.setStatus("public");
        portfolioService.save(port);
        return "Set Port to Public";
    }

    @PostMapping("/getEditPend")
    public ResponseEntity<String> geteditPend(@RequestParam long portId) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Portfolio port = portfolioService.getPortfolioByIdd(portId);
        String jsonString = "";
        try {
            jsonString = mapper.writeValueAsString(port);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return ResponseEntity.ok(EncryptionUtil.encrypt(jsonString));
    }

    @PostMapping("/setToPending")
    public String setToRequest(@RequestParam Long portId) {
        
        Portfolio port = portfolioService.getPortfolioByIdd(portId);
        port.setStatus("pending");
        portfolioService.save(port);
        return "Set Port to Request";
    }

    @PostMapping("/setToPrivate")
    public String setToPrivate(@RequestParam Long portId) {
        Portfolio port = portfolioService.getPortfolioByIdd(portId);
        port.setStatus("private");
        portfolioService.save(port);
        return "Set Port to Denied ";
    }
    // Fix
    @GetMapping("/getStocksPerc")
    public List<PortStock> getStocksPerc(@RequestParam Long portId) throws Exception {
        List<PortStock> portStocks = portfolioService.getPortStocks(portId);
        // return EncryptionUtil.encryptFields(portStocks);
        return portStocks;
    }

    @GetMapping("/getProfilePortfolios")
    public String getProfilePortfolios(@RequestParam Long userId) throws Exception {
        List<Portfolio> portfolios = portfolioService.getProfilePortfolios(userId);
        HashMap<String, Object> map = new HashMap<>();
        map.put("content", portfolios);
        return EncryptionUtil.encryptFields(map);
    }




    // public void generateBackTest(List<Long> stocks, List<Double> shares, Portfolio port) {
    //     logger.debug("Generating backtest for port: {}", port);
    //     logger.debug("Stocks: {}", stocks);
    //     logger.debug("Shares: {}", shares);
    //     List<Object[]> stockData = stockController.getStocksDataCustom(stocks);
    //     PortData portData;
    //     List<PortData> portDataList = new ArrayList<>();
    //     for (int i = 0; i < stockData.size(); i++) {
    //         portData = new PortData();
    //         Object[] stockPrices = stockData.get(i);
    //         try {
    //             portData.setTimestamp((ZonedDateTime) stockPrices[0]);
    //             double price = 0;
    //             for (int j = 1; j < stockPrices.length; j++) {
    //                 price = price + (double) stockPrices[j] * shares.get(j - 1);
    //             }
    //             portData.setValue(price);
    //             portData.setPortId(port);
    //             portDataList.add(portData);
    //         } catch (Exception e) {
    //             logger.error("Error in generating backtest", e);
    //         }
    //     }
    //     logger.debug("Saving port data: {}", portDataList);
    //     portfolioService.savePortData(portDataList);

    // }


    public double generateBackTest(List<String> stocks,List<Double> shares, Portfolio port) throws Exception{
        ArrayList<Object> values = backtester.getAnalystValues(stocks, shares);
        ArrayList<Double> valueHist = (ArrayList<Double>) values.get(4);
        ArrayList<String> dateHistStrings = (ArrayList<String>) values.get(5);
        ArrayList<ZonedDateTime> dateHist = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ISO_ZONED_DATE_TIME;

        for (String dateStr : dateHistStrings) {
            ZonedDateTime zonedDateTime = ZonedDateTime.parse(dateStr, formatter);
            dateHist.add(zonedDateTime);
        }
        ArrayList<Long> convertedDates = new ArrayList<>();
        for (ZonedDateTime dateStr : dateHist) {
            Instant instant = dateStr.toInstant();
            convertedDates.add(instant.getEpochSecond());
        }
        PortData portData;
        List<PortData> portDataList = new ArrayList<>();
        for (int i = 0; i < valueHist.size(); i++) {
            portData = new PortData();
            try {
                portData.setTimestamp(dateHist.get(i));
                portData.setValue(valueHist.get(i));
                portData.setPortId(port);
                portDataList.add(portData);
            } catch (Exception e) {
                logger.error("Error in generating backtest", e);
            }
        }
        // logger.debug("Saving port data: {}", portDataList);
        portfolioService.savePortData(portDataList);
        return roundToTwoDecimalPlaces((double) values.get(0));

    }

    @PostMapping("/create")
    public Long createPort(@RequestBody Map<String, Object> portData) throws Exception {
        logger.debug("Creating port with data: {}", portData);
        try {
            // Converts variables from the frontend to String types
            Portfolio port = new Portfolio();

            ZonedDateTime now = ZonedDateTime.now(ZoneId.of("America/New_York"));
            port.setCreationDate(now);
            port.setLastRebalanceDate(now);
            port.setPublishDate(null);

            String title = (String) portData.get("title");
            port.setTitle(title);

            String description = (String) portData.get("description");
            port.setDescription(description);

            String sector = (String) portData.get("sector");
            String sectorTicker = sectorTickerMap.get(sector);
            port.setSector(sectorTicker);

            Integer authorStr = (Integer) portData.get("author");
            Long authorLong = authorStr.longValue();
            port.setAuthorId(authorLong);
            users author = userController.getUserById(authorLong);
            port.setAuthorName(author.getUsername());
            // port.setAuthor(author);


            port.setStatus("creating");
            port = portfolioService.save(port);
            List<String> tickers = (List<String>) portData.get("stocks");
            Map<String, List<?>> stuff = addPortStocks(port.getId(), tickers, (List<String>) portData.get("percentages"),"active");
            List<Double> shares = (List<Double>) stuff.get("shares");
            // List<Long> stockIds = (List<Long>) stuff.get("stockIds");
            // List<String> tickers = (List<String>) portData.get("stocks");
            // List<String> percentages = (List<String>) portData.get("percentages");
            // List<Double> weights = percentages.stream().map(Double::parseDouble).collect(Collectors.toList());
            // double totalWeights = weights.stream().mapToDouble(Double::doubleValue).sum();
            // List<Double> shares = new ArrayList<>();
            // List<Long> stockIds = new ArrayList<>();
            // List<PortStock> portStocks = new ArrayList<>();
            // // to get the new id of the portfolio (use if this breaks)
            // port = portfolioService.save(port);
            // PortStock portStock;
            // for (int i = 0; i < tickers.size(); i++) {
            //     portStock = new PortStock();
            //     Stock stock = stockController.getStock(tickers.get(i));
            //     double weight = weights.get(i) * 100 / totalWeights;

            //     portStock.setStockId(stock);
            //     portStock.setPortId(port);
            //     portStock.setInitPerc(weight);
            //     portStock.setCurPerc(weight);
            //     portStock.setAvgPrice(stock.getPrice());
            //     portStock.setShare(weight / stock.getPrice());

            //     shares.add(portStock.getShare());
            //     stockIds.add(stock.getStockId());
            //     portStocks.add(portStock);

            // }
            // portfolioService.savePortStock(portStocks);
            port.setRisk(risk_num_calc.getRisk(tickers, shares, "SPY"));

            double expense = ER.getExpenseRatio(tickers, shares, port.getRisk());
            
            port.setExpenseRatio(roundToTwoDecimalPlaces(expense));

            port.setDailyPnl(0);

            port.setStatus("private");

            port.setLastValue(100);

            final Portfolio finalPort = portfolioService.save(port);

            double avgAnnualReturn = generateBackTest(tickers, shares, finalPort);
            setBasicStats(finalPort);
            finalPort.setAnnualReturn(avgAnnualReturn);
            
            logger.debug("Kaidens Annual Return: {}", avgAnnualReturn);
        ArrayList<Object> values = backtester.getAnalystValues(tickers, shares);
        port.setSharpeRatio(roundToTwoDecimalPlaces((double) values.get(3)));
        port.setMaxDrawdown(roundToTwoDecimalPlaces((double) values.get(2)));
        ArrayList<Double> valueHist = (ArrayList<Double>) values.get(4);
        double pnl = roundToTwoDecimalPlaces(
                (valueHist.get(valueHist.size() - 1) - valueHist.get(0)) / valueHist.get(0) * 100);
        port.setTotalPnL(pnl);
        logger.debug("Johns Annual Return: {}", (double) values.get(0));
        port.setAnnualReturn(roundToTwoDecimalPlaces((double) values.get(0)));

            port = portfolioService.save(port);
            return port.getId();
        } catch (Exception e) {
            logger.error("Error creating port", e);
            return null;
        }
    }

    public double roundToTwoDecimalPlaces(double value) {
        BigDecimal bd = new BigDecimal(value);
        bd = bd.setScale(2, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }

    private int findClosestDateIndex(List<LocalDateTime> dateHist, LocalDateTime specificDate) {
        return IntStream.range(0, dateHist.size())
                .reduce((closestIndex, currentIndex) -> {
                    long currentDiff = Math.abs(dateHist.get(currentIndex).toEpochSecond(ZoneOffset.UTC)
                            - specificDate.toEpochSecond(ZoneOffset.UTC));
                    long closestDiff = Math.abs(dateHist.get(closestIndex).toEpochSecond(ZoneOffset.UTC)
                            - specificDate.toEpochSecond(ZoneOffset.UTC));
                    return currentDiff < closestDiff ? currentIndex : closestIndex;
                })
                .orElse(-1); // Return -1 if the list is empty
    }

    
    
    
    public PortfolioChartData getChartData(@RequestParam Long portId,@RequestParam double ratio, @RequestParam String period, @RequestParam String interval, @RequestParam(defaultValue = "0") Long userId) {
        // interval: minute, hour, day, month

        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("America/New_York"));
        ZonedDateTime startDate;
        MarketStatus marketdata = stockController.getMarketStatusData();
        switch (period) {
            case "MAX":
                startDate = ZonedDateTime.of(1970, 1, 1, 0, 0, 0, 0, ZoneId.of("America/New_York"));
                break;
            case "1Y":
                startDate = now.minusYears(1).withMinute(0).withSecond(0).withNano(0);
                break;
            case "6M":
                startDate = now.minusMonths(6).withMinute(0).withSecond(0).withNano(0);
                break;
            case "1M":
                startDate = now.minusMonths(1).withMinute(0).withSecond(0).withNano(0);
                break;
            case "1W":
                startDate = now.minusDays(5).withHour(0).withMinute(0).withSecond(0).withNano(0);
                break;
            case "1D":
                startDate = marketdata.getStartDate();
                break;
            default:
                startDate = now.minusYears(1); // Default to 1 year
        }

        // logger.debug("Getting chart data for portId: {}, startDate: {}, interval: {}, ratio: {}", portId, startDate,
                // interval, ratio);

        List<ZonedDateTime> dateHist = portfolioService.getChartDataDates(portId, startDate, interval);
        if (!dateHist.isEmpty()) {
            // logger.debug("DateHist: {} {}", dateHist.get(0), dateHist.get(1));
        }
        
        List<Double> valueHist = portfolioService.getChartDataValues(portId, startDate, interval, ratio);
        
        return new PortfolioChartData(dateHist, valueHist);
    }
    @PostMapping("/getLiveIndex")
    public int findClosestDateIndex(@RequestBody Map<String, Object> dateDate) {
        List<Integer> dateHist = (List<Integer>) dateDate.get("dateHist");
        Integer specificDate = (Integer) dateDate.get("specificDate");
        // Perform a binary search for the specificDate
        int index = Collections.binarySearch(dateHist, specificDate);
    
        // If exact match is found, return the index
        if (index >= 0) {
            return index;
        }
    
        // If no exact match is found, binarySearch returns (-(insertion point) - 1)
        int insertionPoint = -(index + 1);
    
        // Return the first date that is after the specificDate
        if (insertionPoint < dateHist.size()) {
            return insertionPoint;
        }

    
        // If specificDate is after all dates in the list, return the last index
        return dateHist.size() - 1;
    }

    // @GetMapping("/getChartData")
    public String publicGetChartData(@RequestParam Long portId,@RequestParam double ratio, @RequestParam String period, @RequestParam String interval, @RequestParam(defaultValue = "0") Long userId) throws Exception {
        return EncryptionUtil.encryptFields(getChartData(portId,ratio, period, interval, userId));
    }

    // updating variables
    // dailyPnl
    // currentPercentages
    // risk
    // expenseRatio (will be on investor side)
    // totalPnl (will be on investor side)
    // annualReturn

    // this should be an updating variable
    // be called set setDailyPnl
    public double calculateDailyPnl(@RequestParam Long portId) {

        // hopefully ill modify market_status.py to get the previous day close also
        // eventually should be lastclose of the last day
        MarketStatus marketdata = stockController.getMarketStatusData();
        ZonedDateTime startDate = marketdata.getStartDate();
        List<Double> portData = portfolioService.getChartDataValues(portId, startDate, "minute", 1);
        try {
            if (portData.size() < 2) {
                return 0;
            }
            double dailyPnl = portData.get(portData.size() - 1) - portData.get(0);
            dailyPnl = roundToTwoDecimalPlaces(dailyPnl);
            return dailyPnl;
        } catch (Exception e) {
            logger.error("Error calculating daily pnl", e);
            return 0;
        }
    }
    @GetMapping("/getScore")
    public double getLeaderboardScore(Portfolio port) {
        if(!port.getStatus().equals("public")){
            return 0;
        }
        return portfolioService.getScore(port.getId(),port.getPublishDate());

    }

    // Im thining of moving these calculations to the front end

    
    
    
    
    // publish pending ports, edit pending ports, public ports, investing/private ports


    // Pending/Editing Ports query
    @GetMapping("/getPendingPorts")
    public String getPendingPortfolios() throws Exception {
        Page<Portfolio> portfolios = portfolioService.getPendingPortfolios();
        return EncryptionUtil.encryptFields(portfolios);
    }


    // Private/Investing Ports query
    // private with author id or investing with user id condition
    // this will just get the portfolios I will create another function that gets their investments later to get the right calculations
    @GetMapping("/searchPersonalPorts")
    // public Page<Portfolio> getPersonalPortfolios(
    public String getPersonalPortfolios(
        @RequestParam(defaultValue = "title") String searchBy,
        @RequestParam(defaultValue = "") String searchQuery,
        @RequestParam String userId,
        @RequestParam(defaultValue = "annualReturn") String orderBy,
        @RequestParam(defaultValue = "asc") String orderDirection,
        @RequestParam(defaultValue = "0") int page
    ) throws Exception {
        
       Page<Portfolio> portfolios = portfolioService.getPersonalPortfolios(
            searchBy, searchQuery, userId, orderBy, orderDirection, page
        );
        
        // Fix

        // return portfolios;

        return EncryptionUtil.encryptFields(portfolios);
        // return portfolios;
    }

    @GetMapping("/searchPersonalPortIds")
    // public Page<Portfolio> getPersonalPortfolios(
    public String searchPersonalPortIds(
        @RequestParam(defaultValue = "title") String searchBy,
        @RequestParam(defaultValue = "") String searchQuery,
        @RequestParam String userId,
        @RequestParam(defaultValue = "annualReturn") String orderBy,
        @RequestParam(defaultValue = "asc") String orderDirection,
        @RequestParam(defaultValue = "0") int page
    ) throws Exception {
        
        List<Long> portfolios = portfolioService.getPersonalPortfolioIds(
            searchBy, searchQuery, userId, orderBy, orderDirection, page
        );
        logger.debug("Portfolios: {}", portfolios);
        HashMap<String, List<Long>> map = new HashMap<>();
        map.put("content", portfolios);
        
        // Fix

        // return portfolios;
        logger.debug("Map: {}", map);
        return EncryptionUtil.encryptFields(map);
        // return portfolios;
    }

    // Public Ports query
    @GetMapping("/searchPublicPorts")
    public String getPublicPortfolios(
        @RequestParam(defaultValue = "title") String searchBy,
        @RequestParam(defaultValue = "") String searchQuery,
        @RequestParam(defaultValue = "annualReturn") String orderBy,
        @RequestParam(defaultValue = "asc") String orderDirection,
        @RequestParam(defaultValue = "0") int page
    ) throws Exception {
        Page<Portfolio> portfolios = portfolioService.getPublicPortfolios(
            searchBy, searchQuery, orderBy, orderDirection, page
        );
        // Fix

        // return portfolios;

        return EncryptionUtil.encryptFields(portfolios);
    }

    @GetMapping("/searchPublicPortIds")
    public String getPublicPortfolioIds(
        @RequestParam(defaultValue = "title") String searchBy,
        @RequestParam(defaultValue = "") String searchQuery,
        @RequestParam(defaultValue = "annualReturn") String orderBy,
        @RequestParam(defaultValue = "asc") String orderDirection,
        @RequestParam(defaultValue = "0") int page
    ) throws Exception {

        try{
        logger.debug("Getting public portfolio ids: {} {} {} {} {}", searchBy, searchQuery, orderBy, orderDirection, page);
        List<Long> portfolios = portfolioService.getPublicPortfolioIds(
            searchBy, searchQuery, orderBy, orderDirection, page
        );
        logger.debug("Portfolios: {}", portfolios);
        HashMap<String, Object> map = new HashMap<>();
        map.put("content", portfolios);
        logger.debug("Map: {}", map);

        return EncryptionUtil.encryptFields(map);
        } catch (Exception e) {
            logger.error("Error getting public portfolio ids", e);
            throw e; // Rethrow the exception to be handled by the global exception handler
        }
    }




    
    @GetMapping("/searchPrivatePorts")
    public String getPrivatePortfolios(
        @RequestParam(defaultValue = "title") String searchBy,
        @RequestParam(defaultValue = "") String searchQuery,
        @RequestParam(defaultValue = "annualReturn") String orderBy,
        @RequestParam(defaultValue = "asc") String orderDirection,
        @RequestParam(defaultValue = "0") int page
    ) throws Exception {
        Page<Portfolio> portfolios = portfolioService.getPrivatePortfolios(
            searchBy, searchQuery, orderBy, orderDirection, page
        );
        // Fix

        // return portfolios;

        return EncryptionUtil.encryptFields(portfolios);
    }

    
    

    @GetMapping("/getPort")
    // public Portfolio getPort(@RequestParam Long portId, @RequestParam(defaultValue = "-1") Long userId) throws Exception{
    public String getPort(@RequestParam Long portId, @RequestParam(defaultValue = "-1") Long userId) throws Exception{
        Map<String, List<?>> graph = portfolioService.getCardGraphData(portId);

        logger.debug("Requesting port: {}", portId);
        Optional<Investment> isInvesting= investmentController.isInvestingPort(portId, userId);
        Map<String, Boolean> activityMap = activityService.getSocialInfo(userId, portId);
        Map<String, List<?>> cardGraphData = portfolioService.getCardGraphData(portId);
        Portfolio port = portfolioService.getPortfolioByIdd(portId);
        port.setLikeStatus(activityMap.get("like"));
        port.setFavoriteStatus(activityMap.get("favorite"));
        port.setCardValues((List<Double>) cardGraphData.get("values"));
        port.setCardDates((List<ZonedDateTime>) cardGraphData.get("dates"));
        double ratio;
        if (isInvesting.isPresent()){
            Investment investment = isInvesting.get();
            port.setRatio(investment.getRatio());
            ratio = investment.getRatio();
            port.setReserve(investment.getReserve());
            port.setInvestmentDate(investment.getCreationDate());
        } else{
            ratio = 1;
            port.setRatio(0);
            port.setInvestmentDate(port.getCreationDate());
        }
        
        port.setLastValue(roundToTwoDecimalPlaces(port.getLastValue() * ratio));
        port.setDailyPnl(roundToTwoDecimalPlaces(port.getDailyPnl() * ratio));

        Map<String, Object> map = new HashMap<>();
        map.put("port", port);
        map.put("graph", graph);
        // port.setCreationDate(creationDate);
    // Fix
    return EncryptionUtil.encryptFields(map);
    // return port;
    
    // return port;
    
    // return port;
    }



    @GetMapping("/getExtraPortData")
    public String getExtraPortData(Long portId, Long userId) throws Exception {
        try {
        logger.debug("Requesting extra port data: {}", portId);
        HashMap<String, Object> map = new HashMap<>();
        // get graph data
        map.put("graphData", portfolioService.getDetailGraphData(portId));
        map.put("comments", activityService.findPortComments(portId));
        map.put("stocks", portfolioService.getPortStocks(portId));
        // Optional<Investment> investment = investmentController.isInvestingPort(portId, userId);
        // if (investment.isPresent()) {
        //     privateMap.put("investment", investment.get());
        // } else {
        //     privateMap.put("investment", null);
        // }
        


        return EncryptionUtil.encryptFields(map);
    } catch
    (Exception e) {
            logger.error("Error getting extra port data", e);
            throw e; // Rethrow the exception to be handled by the global exception handler
    }
    }



    @PostMapping("/getPortView")
    public String getPortView(@RequestBody Map<String, Object> portDraft) throws Exception {
        logger.debug("Getting port view: {}", portDraft);
        List<String> stocks = (List<String>) portDraft.get("stocks");
        List<Integer> prices = (List<Integer>) portDraft.get("prices");
        List<Integer> percentages = (List<Integer>) portDraft.get("percents");
        Integer totalWeights = percentages
        .stream().mapToInt(Integer::intValue).sum();
        List<Double> shares = new ArrayList<Double>();
        String sector = (String) portDraft.get("sector");
        String sectorTicker = sectorTickerMap.get(sector);
        for (int i = 0; i < stocks.size(); i++) {
            try {
                Double percent = percentages.get(i)* 100.0 / totalWeights;
                Double price = ((Number) prices.get(i)).doubleValue() / 100.0;
                shares.add(percent / price);
            } catch (Exception e) {
                logger.debug("Error in getting shares: {}", e);
            }
        }
        double risk = risk_num_calc.getRisk(stocks, shares, sectorTicker);
        logger.debug("{} {}", stocks, shares);
        ArrayList<Object> values = backtester.getAnalystValues(stocks, shares);
        ArrayList<Double> valueHist = (ArrayList<Double>) values.get(4);
        List<String> valueHistString = valueHist.stream().map((Double value) -> String.valueOf(value))
                .collect(Collectors.toList());

        String pnl = String.valueOf(roundToTwoDecimalPlaces(
                (valueHist.get(valueHist.size() - 1) - valueHist.get(0)) / valueHist.get(0) * 100));
        ArrayList<String> dateHistStrings = (ArrayList<String>) values.get(5);
        ArrayList<ZonedDateTime> dateHist = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ISO_ZONED_DATE_TIME;

        for (String dateStr : dateHistStrings) {
            ZonedDateTime zonedDateTime = ZonedDateTime.parse(dateStr, formatter);
            dateHist.add(zonedDateTime);
        }
        ArrayList<Long> convertedDates = new ArrayList<>();
        for (ZonedDateTime dateStr : dateHist) {
            Instant instant = dateStr.toInstant();
            convertedDates.add(instant.getEpochSecond());
        }
        Map<String, Object> portView = new HashMap<>();
        portView.put("Annual Return", roundToTwoDecimalPlaces((double) values.get(0)));
        portView.put("Max Drawdown", roundToTwoDecimalPlaces((double) values.get(2)));
        portView.put("Risk", risk);
        portView.put("Sharpe Ratio", roundToTwoDecimalPlaces((double) values.get(3)));
        portView.put("Value Hist", valueHistString);
        portView.put("Date Hist", convertedDates);
        portView.put("PNL", pnl);

        return EncryptionUtil.encryptFields(portView);
    }


    public void KeyUpdater() throws IOException {
        TokenManager.resetKey();
    }

    // needs to be seperated into a get and a calculate
    @GetMapping("/calculateRisk")
    public double calculateRisk(List<String> stocks, List<Double> shares, String sector) {
        double risk = risk_num_calc.getRisk(stocks, shares, sector);
        return risk;
    }
    public double calculateNumberOfYears(List<ZonedDateTime> dateHist) {
        if (dateHist == null || dateHist.isEmpty()) {
            throw new IllegalArgumentException("The dateHist list cannot be null or empty.");
        }

        ZonedDateTime earliestDate = dateHist.stream().min(ZonedDateTime::compareTo).orElseThrow();
        ZonedDateTime latestDate = dateHist.stream().max(ZonedDateTime::compareTo).orElseThrow();

        long daysBetween = ChronoUnit.DAYS.between(earliestDate, latestDate);
        double yearsBetween = daysBetween / 365.25; // Approximate number of days in a year

        return yearsBetween;
    }

    public double calculateNumberOfHours(ZonedDateTime earliestDate, ZonedDateTime latestDate) {


        long hoursBetween = ChronoUnit.HOURS.between(earliestDate, latestDate);

        return hoursBetween;
    }

    public double calculateAvgAnnualReturn(Long portId) {
        PortfolioChartData portData = getChartData(portId,1, "MAX", "minute", 0L);
        List<Double> valueHist = portData.valueHist;
        List<ZonedDateTime> dateHist = portData.dateHist;
        double initial_value = valueHist.get(0);
        double final_value = valueHist.get(valueHist.size() - 1);
        double numOfYears = calculateNumberOfYears(dateHist);
        double avgAnnualReturn = (Math.pow(final_value / initial_value, 1 / numOfYears) - 1) * 100;
        return avgAnnualReturn;
    }

    public ArrayList<Object> calculateAnalystValues(@RequestBody Map<String, Object> portData) throws Exception {
        List<String> stocks = (List<String>) portData.get("stocks");
        List<Double> shares = (List<Double>) portData.get("shares");
        ArrayList<Object> values = backtester.getAnalystValues(stocks, shares);
        return values;
    }

    public double calculateExpenseRatio(List<String> stocks, List<Double> shares, Double risk) {
        double expense = 0;
        try {
            expense = ER.getExpenseRatio(stocks, shares, risk);
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return expense;
    }
    // remove 2 0s
    


    // cur_percentages
    // daily_pnl
    // last_value



    public void setBasicStats(Portfolio port) {
        Long portId = port.getId();
        MarketStatus marketdata = stockController.getMarketStatusData();
        ZonedDateTime date = marketdata.getPreviousCloseDate();
        port.setPreviousClose(portfolioService.getValue(portId, date));
        // logger.debug("Previous Close: {}", portfolioService.getValue(portId, date));
        date = marketdata.getStartDate();
        List<Double> values = portfolioService.getScoreData(portId, date);
        port.setOpen(values.get(0));
        // logger.debug("Open: {}", values.get(0));
        port.setHigh(Collections.max(values));
        // logger.debug("High: {}", Collections.max(values));
        port.setLow(Collections.min(values));
        // logger.debug("Low: {}", Collections.min(values));
        portfolioService.save(port);
        
    }

    public void setInvestmentStats(Portfolio port){
     List<Investment> investments =  investmentController.findInvestmentsByPortId(port.getId());
     port.setInvestors(investments.size());
     double value = port.getLastValue();
     double totalInvested = 0;
     for (Investment investment : investments){
        totalInvested += investment.getRatio() * value;
     }
     port.setTotalInvested(totalInvested);
    }







    @PostMapping("/updatePort")
    public void updatePort(@RequestParam Long id) {
        // logger.debug("Updating portfolio: {}", id);
        Portfolio port = portfolioService.getPortfolioByIdd(id);
        List<PortStock> portStocks = portfolioService.getPortStocks(id);

        
        for (PortStock portStock : portStocks) {
            logger.debug("Updating stock id: {} {} {} {}", id,portStock.getStockId().getStockId(),portStock.getStockId().getTicker(), portStock.getStockId().getPrice());
        }
  
    
        double lastValue = portStocks.stream()
                .mapToDouble(portStock -> portStock.getStockId().getPrice() * portStock.getShare())
                .sum();
        port.setLastValue(roundToTwoDecimalPlaces(lastValue));
        // logger.debug("Last Value: {}", lastValue);
        portStocks = portStocks.parallelStream().map(
            portStock -> {
                double price = portStock.getStockId().getPrice();
                double share = portStock.getShare();
                portStock.setCurPerc(price * share *100 / lastValue);
                return portStock;
            }).collect(Collectors.toList());

        // Group by sector to sum percentages in one pass
        Map<String, Double> sectorPercentages = new HashMap<>();
        for (PortStock portStock : portStocks) {
            sectorPercentages.merge(portStock.getStockId().getSector(), portStock.getCurPerc(), Double::sum);
        }
        
        // Apply updates in batch
        
        double dailyPnl = calculateDailyPnl(id);
        // logger.debug("Daily Pnl: {}", dailyPnl);
        port.setDailyPnl(dailyPnl);
        portfolioService.savePortStock(portStocks);
        portfolioService.save(port);
        PortData portData = new PortData();
        portData.setPortId(port);
        portData.setValue(lastValue);
        portData.setTimestamp(ZonedDateTime.now(ZoneId.of("America/New_York")));
        List<PortData> portDataList = new ArrayList<>();
        portDataList.add(portData);
        portfolioService.savePortData(portDataList);
        setBasicStats(port);
        logger.debug("commiting investments: {}", id);
        investmentController.commitInvestments(port);
        // we need to activate any closed investments

    }

    // expense ratio
    // risk
    // annual return
    @PostMapping("/dailyUpdatePortfolio")
    public void dailyUpdatePortfolio(Long id) throws Exception {
        logger.debug("Updating portfolio: {}", id);
        Portfolio port = portfolioService.getPortfolioByIdd(id);
        List<String> stocks = new ArrayList<>();
        List<Double> shares = new ArrayList<>();
        List<PortStock> portStocks = portfolioService.getPortStocks(id);
        for (PortStock portStock : portStocks) {
            stocks.add(portStock.getStockId().getTicker());
            shares.add(portStock.getShare());
        }


        double risk = calculateRisk(stocks, shares, port.getSector());

        port.setRisk(roundToTwoDecimalPlaces(risk));
        double expense = calculateExpenseRatio(stocks, shares, risk);
        port.setExpenseRatio(roundToTwoDecimalPlaces(expense));
        double annualReturn = calculateAvgAnnualReturn(id);
        logger.debug("Kaidens Annual Return: {}", annualReturn);
        ArrayList<Object> values = backtester.getAnalystValues(stocks, shares);
        port.setSharpeRatio(roundToTwoDecimalPlaces((double) values.get(3)));
        port.setMaxDrawdown(roundToTwoDecimalPlaces((double) values.get(2)));
        ArrayList<Double> valueHist = (ArrayList<Double>) values.get(4);
        List<String> valueHistString = valueHist.stream().map((Double value) -> String.valueOf(value))
                .collect(Collectors.toList());

        double pnl = roundToTwoDecimalPlaces(
                (valueHist.get(valueHist.size() - 1) - valueHist.get(0)) / valueHist.get(0) * 100);
        port.setTotalPnL(pnl);
        logger.debug("Johns Annual Return: {}", (double) values.get(0));
        port.setAnnualReturn(roundToTwoDecimalPlaces((double) values.get(0)));
        port.setMaxReturn(roundToTwoDecimalPlaces(getLeaderboardScore(port)));
        setInvestmentStats(port);
        portfolioService.save(port);
    }

    public Map<String, List<?>> addPortStocks(Long portId, List<String> tickers, List<String> percentages, String status){
            List<Double> weights = percentages.stream().map(Double::parseDouble).collect(Collectors.toList());
            double totalWeights = weights.stream().mapToDouble(Double::doubleValue).sum();
            List<Double> shares = new ArrayList<>();
            List<String> stockIds = new ArrayList<>();
            List<PortStock> portStocks = new ArrayList<>();
            PortStock portStock;
            for (int i = 0; i < tickers.size(); i++) {
                portStock = new PortStock();
                logger.debug("ticker {}:", tickers.get(i));
                Stock stock = stockController.getStock(tickers.get(i));
                if (stock == null) {
                    logger.error("Stock not found: {}", tickers.get(i));
                }else{
                    logger.debug("Stock found: {} {} {}", stock.getTicker(), stock.getPrice(), stock.getStockId());
                }
                double weight = weights.get(i) * 100 / totalWeights;

                portStock.setStockId(stock);
                portStock.setPortId(portId);
                portStock.setInitPerc(weight);
                portStock.setCurPerc(weight);
                portStock.setAvgPrice(stock.getPrice());
                portStock.setShare(weight / stock.getPrice());
                portStock.setStatus(status);

                shares.add(portStock.getShare());
                stockIds.add(stock.getTicker());
                portStocks.add(portStock);

            }
            portfolioService.savePortStock(portStocks);

            Map<String, List<?>> result = new HashMap<>();
            result.put("stockIds", stockIds);
            result.put("shares", shares);
        
            return result;
    }
    @PostMapping("/viewed")
    public void viewed(@RequestParam Long portId) {
        Portfolio port = portfolioService.getPortfolioByIdd(portId);
        port.setViews(port.getViews() + 1);
        portfolioService.save(port);
    }

    @GetMapping("/canEditPort")
    public String canEditPort(@RequestParam Long portId) throws Exception{
        Portfolio port = portfolioService.getPortfolioByIdd(portId);
        double hoursBetween = calculateNumberOfHours(port.getLastRebalanceDate(), ZonedDateTime.now(ZoneId.of("America/New_York")));
        Map<String, Object> response = new HashMap<>();
        response.put("canEdit", hoursBetween > 168);
        return EncryptionUtil.encryptFields(response);
    }

    @PostMapping("/requestEditPort")
    public void requestEditPort(@RequestBody Map<String, Object> stockData, @RequestParam Long portId) {
        logger.debug("Requesting edit for port: {}", portId);
        List<String> stocks = (List<String>) stockData.get("stocks");
        List<String> percents = (List<String>) stockData.get("percentages");
        addPortStocks(portId, stocks, percents, "pending");
    }
    
    // @PostMapping("/editPort")
    // public void editPort(@RequestParam Long portId){
    //     logger.debug("Editing port: {}", portId);
    //     Portfolio port = portfolioService.getPortfolioByIdd(portId);
    //     Set<PortStock> portStocks = port.getPortStocks();
    //     getPortStocks(port.getId());
    //     portfolioService.replacePortStocks(portStocks);
    //     // make sure to initiate daily update on the front end side of things 
    //     // after running this
    // }

    // @GetMapping("/getEditPortfolios")
    // public String getEditPortfolios() throws Exception {
    //     List<Portfolio> ports = portfolioService.getEditPortfolios();
    //     Map<String, List<Portfolio>> responseMap = new HashMap<>();
    //     responseMap.put("content", ports);
    //     return EncryptionUtil.encryptFields(responseMap);
    // }
    @DeleteMapping("/delete")
    public ResponseEntity<String> deletePortfolio(@RequestParam long portId) {
    try {
    investmentController.dell(portId);
    portfolioService.deletePortStocks(portId);
    portfolioService.deletePortData(portId);
    portfolioService.deletePortfolio(portId);
    return ResponseEntity.ok("Portfolio deleted successfully.");
    } catch (RuntimeException e) {
    return ResponseEntity.status(404).body(e.getMessage());
    }
    }


    @GetMapping("/getPortStocks")
    public String getPortStocks(@RequestParam Long portId) throws Exception {
        List<PortStock> portStocks = portfolioService.getPortStocks(portId);
        HashMap<String, List<PortStock>> response = new HashMap<>();
        response.put("content", portStocks);

        return EncryptionUtil.encryptFields(response);
    }

    @GetMapping("/getDetailGraphs")
    public String getDetailGraphs(@RequestParam Long portId) throws Exception {
        Map<String, List<?>> response = portfolioService.getDetailGraphData(portId);
        return EncryptionUtil.encryptFields(response);
    }

    @GetMapping("/getCardGraphs")
    public String getCardGraphs(@RequestParam Long portId) throws Exception {
        Map<String, List<?>> response = portfolioService.getCardGraphData(portId);
        return EncryptionUtil.encryptFields(response);
    }



   
}
