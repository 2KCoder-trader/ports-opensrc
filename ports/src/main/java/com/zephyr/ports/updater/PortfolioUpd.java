package com.zephyr.ports.updater;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.checkerframework.checker.units.qual.A;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zephyr.ports.portfolios.Agg;
import com.zephyr.ports.portfolios.Agg1D;
import com.zephyr.ports.portfolios.Agg1W;
import com.zephyr.ports.portfolios.Agg1Y;
import com.zephyr.ports.portfolios.AggAT;
import com.zephyr.ports.portfolios.AggRepository;
import com.zephyr.ports.portfolios.AggYTD;
import com.zephyr.ports.portfolios.CardAggAll;
import com.zephyr.ports.portfolios.CardAggDay;
// import com.zephyr.ports.portfolios.CardAggAll;
// import com.zephyr.ports.portfolios.CardAggDay;
import com.zephyr.ports.portfolios.PortData;
import com.zephyr.ports.portfolios.PortfolioController;
import com.zephyr.ports.portfolios.PortfolioService;
import com.zephyr.ports.stocks.MarketStatus;
import com.zephyr.ports.stocks.StockController;





@RestController
@RequestMapping("ports/port/updater")
public class PortfolioUpd {

    
    private static final Logger logger = LoggerFactory.getLogger(PortfolioUpd.class);

    @Autowired
    private final PortfolioController portfolioController;

    @Autowired
    private final StockController stockController;

    @Autowired
    private final PortfolioService portfolioService;

    @Autowired
    private AggRepository aggRepository;

    public PortfolioUpd(PortfolioController portfolioController, StockController stockController, PortfolioService portfolioService) {
        this.portfolioController = portfolioController;
        this.stockController = stockController;
        this.portfolioService = portfolioService;
    }

    @Value("${scheduled.enabled}")
    private boolean scheduledEnabled;

    private boolean isSchedulingEnabled() {
        return scheduledEnabled;
    }

    @Scheduled(fixedDelay = 60000)
    public void updatePortfoliosMinutely() throws Exception {
        if (!isSchedulingEnabled()) {
            return; // Skip execution if scheduling is disabled
        }
        MarketStatus marketdata = stockController.getMarketStatusData();
        logger.debug("Updating portfolios Market Status: {}", marketdata.getStartDate());
        logger.debug("Market Open: {}", marketdata.isMarketOpen());
        if (!marketdata.isMarketOpen()) {
            return;
        }
            logger.debug("Updating portfolios {}", marketdata.getCloseDate());
            ExecutorService executor = Executors.newFixedThreadPool(10);
            List<Long> portIds = portfolioService.getIds();
            // logger.debug("Updating public portfolios {}", portIds.size());
            for (Long id : portIds) {
                executor.submit(() -> {
                    try {
                        portfolioController.updatePort(id);
                    } catch (Exception e) {
                        logger.error("Error updating port {}", id, e);
                    }
                });
            }
            // activate any closed investments

            executor.shutdown();
            executor.awaitTermination(Long.MAX_VALUE, TimeUnit.NANOSECONDS);
            // logger.debug("Finished updating portfolios");
        
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void updatePortfoliosDaily() throws Exception {
        if (!isSchedulingEnabled()) {
            return; // Skip execution if scheduling is disabled
        }    
            logger.debug("Starting daily update of portfolios");
            ExecutorService executor = Executors.newFixedThreadPool(10);
            List<Long> portIds = portfolioService.getIds();
            for (Long id : portIds) {
                executor.submit(() -> {
                    try {
                        portfolioController.dailyUpdatePortfolio(id);
                    } catch (Exception e) {
                        logger.error("Error updating port {}", id, e);
                    }
                });
            }
            // activate any closed investments

            // executor.shutdown();
            // executor.awaitTermination(Long.MAX_VALUE, TimeUnit.NANOSECONDS);
            logger.debug("Finished updating portfolios");

    }


    // @Scheduled(fixedDelay = 60000)
    @GetMapping("/updateAgg1Day")
    public void updatingAgg1Day(){
        if (!isSchedulingEnabled()) {
            return; // Skip execution if scheduling is disabled
        }
    
        logger.debug("Updating Agg1Day");
        // the goal of this is to add rows to agg1day there will be seperate function for deleteling which will occur right be for market open
        // get all portIds
        List<Long> portIds = portfolioService.getIds();
        ExecutorService executor = Executors.newFixedThreadPool(10);
        MarketStatus marketdata = stockController.getMarketStatusData();
        for (Long id : portIds) {
            // get all portData for each portId
            // logger.debug("Updating Agg1Day for port {}", id);
            executor.submit(() -> {
                try {
                    updateAgg1Day(id,marketdata.getStartDate());
                    // updateAggCardDay(id, marketdata.getStartDate());
                } catch (Exception e) {
                    logger.error("Error updating port {}", id, e);
                }
            });


        }
        logger.debug("Finished updating Agg1Day");
    }

        // @Scheduled(fixedDelay = 3600000)
        public void updatingAgg1Week(){
            if (!isSchedulingEnabled()) {
                return; // Skip execution if scheduling is disabled
            }
        
            logger.debug("Updating Agg1Week");
            // the goal of this is to add rows to agg1day there will be seperate function for deleteling which will occur right be for market open
            // get all portIds
            List<Long> portIds = portfolioService.getIds();
            ExecutorService executor = Executors.newFixedThreadPool(10);
            ZonedDateTime date = ZonedDateTime.now();
            ZonedDateTime lastWeek = date.minusWeeks(1);
            MarketStatus marketdata = stockController.getMarketStatusData();
            if(!marketdata.isMarketOpen()){
                return;
            }

            for (Long id : portIds) {
                // get all portData for each portId
                executor.submit(() -> {
                    try {
                        updateAgg1Week(id,lastWeek);
                    } catch (Exception e) {
                        logger.error("Error updating port {}", id, e);
                    }
                });
    
    
            }
            logger.debug("Finished updating Agg1Week");
        }

    // @Scheduled(cron = "0 0 0 * * *")
    @GetMapping("/updateAllofAgg")
    public void updatingAgg(){
        // if (!isSchedulingEnabled()) {
        //     return; // Skip execution if scheduling is disabled
        // }
        // logger.debug("Updating Agg1Month, Agg1Year, AggYTD, AggAll");
        List<Long> portIds = portfolioService.getIds();
        ExecutorService executor = Executors.newFixedThreadPool(10);
        ZonedDateTime date = ZonedDateTime.now();
        ZonedDateTime lastMonth = date.minusMonths(1);
        ZonedDateTime lastYear = date.minusYears(1);
        ZonedDateTime ytd = date.withDayOfYear(1);
        ZonedDateTime alltime = date.minusYears(20);
        for (Long id : portIds) {
            logger.debug("Updating Agg1Month, Agg1Year, AggYTD, AggAll for port {}", id);
            // get all portData for each portId
            executor.submit(() -> {
                try {
                    updateAgg1Month(id,lastMonth);
                    updateAgg1Year(id,lastYear);
                    updategAggYTD(id,ytd);
                    updateAggAll(id,alltime);
                    updateAggCardAll(id, alltime);
                } catch (Exception e) {
                    logger.error("Error updating port {}", id, e);
                }
            });


        }
        logger.debug("Finished updating Agg1Month, Agg1Year, AggYTD, AggAll");
    }


    @GetMapping("/updateAgg1Month")
    public Map<String,List<Agg1W>> updateAgg1Month(Long id, ZonedDateTime date){
        
        List<Agg1W> agg1W = getAggData(id, date, Agg1W.class);
        aggRepository.deleteAll(aggRepository.findAllByTypeAndPortId(Agg1W.class, id));
        aggRepository.saveAll(agg1W);
        Map<String,List<Agg1W>> aggData = new HashMap<>();
        aggData.put("agg1W", agg1W);
        return aggData;
    }

    public void updateAgg1Year(Long id, ZonedDateTime date){
        List<Agg1Y> agg1Y = getAggData(id, date, Agg1Y.class);
        aggRepository.deleteAll(aggRepository.findAllByTypeAndPortId(Agg1Y.class, id));
        aggRepository.saveAll(agg1Y);
    }

    public void updategAggYTD(Long id, ZonedDateTime date){
        List<AggYTD> aggYTD = getAggData(id, date, AggYTD.class);
        aggRepository.deleteAll(aggRepository.findAllByTypeAndPortId(AggYTD.class, id));
        aggRepository.saveAll(aggYTD);
    }

    public void updateAggAll(Long id, ZonedDateTime date){
        List<AggAT> aggAT = getAggData(id, date, AggAT.class);
        aggRepository.deleteAll(aggRepository.findAllByTypeAndPortId(AggAT.class, id));
        aggRepository.saveAll(aggAT);
    }
    

    public void updateAgg1Day(Long id, ZonedDateTime date) {
        List<Agg1D> agg1D = getAggData(id, date, Agg1D.class);
        ZonedDateTime lastIndex = agg1D.get(agg1D.size()-1).getTimestamp();
        MarketStatus marketdata = stockController.getMarketStatusData();
        ZonedDateTime endOfMarket = marketdata.getCloseDate();
        int minutes = (int) Math.floor(ChronoUnit.MINUTES.between(lastIndex, endOfMarket));
        for (int i = 0; i < minutes; i++) {
            Agg1D agg = new Agg1D();
            agg.setPortId(id);
            agg.setTimestamp(lastIndex.plusMinutes(i));
            agg.setValue(-1);
            agg1D.add(agg);
        }
        aggRepository.deleteAll(aggRepository.findAllByTypeAndPortId(Agg1D.class, id));
        aggRepository.saveAll(agg1D);
    }

    public void updateAgg1Week(Long id, ZonedDateTime date) {
        List<Agg1W> agg1W = getAggData(id, date, Agg1W.class);
        aggRepository.deleteAll(aggRepository.findAllByTypeAndPortId(Agg1W.class, id));
        aggRepository.saveAll(agg1W);
    }

    public void updateAggCardDay(Long id, ZonedDateTime date) {
    List<CardAggDay> cardAggDay = getCardAggDailyData(id, date);
    // the timestamps need to be treated as indexes and unrelated to time
    ZonedDateTime now = ZonedDateTime.now();
    Integer timeLeft= 21- cardAggDay.size();
    for (int i = 0; i < timeLeft; i++) {
        CardAggDay agg = new CardAggDay();
        agg.setPortId(id);
        agg.setTimestamp(now.plusMinutes(i+1));
        agg.setValue((Double) null);
        cardAggDay.add(agg);
    }
    aggRepository.deleteAll(aggRepository.findAllByTypeAndPortId(CardAggDay.class, id));
    aggRepository.saveAll(cardAggDay);

    }

    public void updateAggCardAll(Long id, ZonedDateTime date) {
        
        List<CardAggAll> aggData = new ArrayList<>();
        List<AggAT> portDatas = getAggData(id, date, AggAT.class);
        Map<ZonedDateTime, Double> aggregatedValues = new HashMap<>();
        int interval =  (int) Math.ceil(portDatas.size()/24);
        logger.debug("Interval: {}", interval);
        for(int i = 0; i < portDatas.size(); i++) {
            // logger.debug("timestamp: {}", portDatas.get(i).getTimestamp());
            if (i % interval == 0) {
                aggregatedValues.put(portDatas.get(i).getTimestamp(), portDatas.get(i).getValue());
            }
            
        }
        
        if (portDatas.size() > 0 &&portDatas.size()-1 % interval != 0) {
            aggregatedValues.put(portDatas.get(portDatas.size()-1).getTimestamp(), portDatas.get(portDatas.size()-1).getValue());
        }
        // logger.debug("aggregatedValues: {}", aggregatedValues.size());
        for (Map.Entry<ZonedDateTime, Double> entry : aggregatedValues.entrySet()) {
            try {
                // logger.debug("AggAll: {}", entry.getValue());
                CardAggAll aggInstance = new CardAggAll();
                aggInstance.setTimestamp(entry.getKey());
                aggInstance.setValue(entry.getValue());
                aggInstance.setPortId(id);
                aggData.add(aggInstance);
            } catch (Exception e) {
                throw new RuntimeException("Failed to create instance of Card Agg Day", e);
            }
        }
        // for(int j = 0; j < aggregatedValues.size(); j++){
        //     logger.debug("AggAll: {}", aggregatedValues.get(j));
        // }

        aggRepository.deleteAll(aggRepository.findAllByTypeAndPortId(CardAggAll.class, id));
        aggRepository.saveAll(aggData);
    

    }


    public List<CardAggDay> getCardAggDailyData(Long id, ZonedDateTime date) {
        List<CardAggDay> aggData = new ArrayList<>();
        Map<ZonedDateTime, Double> aggregatedValues = new HashMap<>();
        List<Agg1D> portDatas = aggRepository.findAllByTypeAndPortId(Agg1D.class, id);
        for(int i = 0; i < portDatas.size(); i++) {
            logger.debug("timestamp: {}", portDatas.get(i).getTimestamp());
            if (i % 20 == 0) {
                aggregatedValues.put(portDatas.get(i).getTimestamp(), portDatas.get(i).getValue());
            }
            
        }
        logger.debug("aggregatedValues: {}", portDatas.size());
        if (portDatas.size() > 0 &&portDatas.size()-1 % 20 != 0) {
            aggregatedValues.put(portDatas.get(portDatas.size()-1).getTimestamp(), portDatas.get(portDatas.size()-1).getValue());
        }
        for (Map.Entry<ZonedDateTime, Double> entry : aggregatedValues.entrySet()) {
            try {
                CardAggDay aggInstance = new CardAggDay();
                aggInstance.setTimestamp(entry.getKey());
                aggInstance.setValue(entry.getValue());
                aggInstance.setPortId(id);
                aggData.add(aggInstance);
            } catch (Exception e) {
                throw new RuntimeException("Failed to create instance of Card Agg Day", e);
            }
        }
        return aggData;
    }



        public <T extends Agg> List<T> getAggData(Long id, ZonedDateTime date, Class<T> clazz) {
    
    List<T> aggData = new ArrayList<>();  // ✅ Correct generic list initialization
    Map<ZonedDateTime, Double> aggregatedValues = new HashMap<>();  // ✅ Used for aggregation
    
    List<PortData> portDatas = portfolioService.getPortData(id, date);
    
    ChronoUnit aggInterval;
    if (clazz.equals(Agg1D.class)) {
        aggInterval = ChronoUnit.MINUTES;
    } else if (clazz.equals(Agg1W.class)) {
        aggInterval = ChronoUnit.HOURS;

    } 
    // else if (clazz.equals(CardAggAll.class)) {
    //     aggInterval = ChronoUnit.MONTHS;
    // } 
    else {
        aggInterval = ChronoUnit.DAYS;
    }

    for (PortData portData : portDatas) {
        ZonedDateTime timestamp = portData.getTimestamp().truncatedTo(aggInterval);
        // Compute last value aggregation
        // aggregatedValues.merge(timestamp, portData.getValue(), (oldValue, newValue) -> (oldValue + newValue) / 2);
        aggregatedValues.put(timestamp, portData.getValue());
    }

    // Convert Map to List<T>
    for (Map.Entry<ZonedDateTime, Double> entry : aggregatedValues.entrySet()) {
        try {
            T aggInstance = clazz.getDeclaredConstructor().newInstance();
            aggInstance.setTimestamp(entry.getKey());
            aggInstance.setValue(entry.getValue());
            aggInstance.setPortId(id);
            aggData.add(aggInstance);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create instance of " + clazz.getName(), e);
        }
    }

    return aggData;
}


        
        
        
        
        // delete all agg1day

    







    }



