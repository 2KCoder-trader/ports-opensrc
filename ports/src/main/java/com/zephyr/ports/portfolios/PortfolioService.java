package com.zephyr.ports.portfolios;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.zephyr.ports.investment.Investment;
import com.zephyr.ports.investment.InvestmentRepository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;

@Service
public class PortfolioService {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioService.class);
    @Autowired
    private PortfolioRepository portfolioRepository;
    @Autowired
    private InvestmentRepository investmentRepository;
    @Autowired
    private PortStockRepository portStockRepository;
    @Autowired
    private PortDataRepository portDataRepository;
    @Autowired
    private AggRepository aggRepository;







    // public List<Portfolio> getEditPortfolios(){
    //     return portfolioRepository.getEditPortfolios();
    // }
    public <T extends Agg> List<Double> getValuesByTypeAndPortId(Class<T> type, Long portId) {
        return aggRepository.findValuesByTypeAndPortId(type, portId);
    }


    public Map<String, List<?>> getDetailGraphData(Long portId){
        Map<String, List<?>> detailGraphData = new HashMap<>();
        detailGraphData.put("agg1DData", aggRepository.findValuesByTypeAndPortId(Agg1D.class, portId));
        detailGraphData.put("agg1WData", aggRepository.findValuesByTypeAndPortId(Agg1W.class, portId));
        detailGraphData.put("agg1MData", aggRepository.findValuesByTypeAndPortId(Agg1M.class, portId));
        detailGraphData.put("agg1YData", aggRepository.findValuesByTypeAndPortId(Agg1Y.class, portId));
        detailGraphData.put("aggYTDData", aggRepository.findValuesByTypeAndPortId(AggYTD.class, portId));
        detailGraphData.put("aggATData", aggRepository.findValuesByTypeAndPortId(AggAT.class, portId));
        detailGraphData.put("agg1DLabels", aggRepository.findTimestampsByTypeAndPortId(Agg1D.class, portId));
        detailGraphData.put("agg1WLabels", aggRepository.findTimestampsByTypeAndPortId(Agg1W.class, portId));
        detailGraphData.put("agg1MLabels", aggRepository.findTimestampsByTypeAndPortId(Agg1M.class, portId));
        detailGraphData.put("agg1YLabels", aggRepository.findTimestampsByTypeAndPortId(Agg1Y.class, portId));
        detailGraphData.put("aggYTDLabels", aggRepository.findTimestampsByTypeAndPortId(AggYTD.class, portId));
        detailGraphData.put("aggATLabels", aggRepository.findTimestampsByTypeAndPortId(AggAT.class, portId));
        return detailGraphData;
    }

    public Map<String, List<?>> getCardGraphData(Long portId){
        Map<String, List<?>> cardGraphData = new HashMap<>();
        // cardGraphData.put("cardAggDayData", aggRepository.findValuesByTypeAndPortId(CardAggDay.class, portId));
        // cardGraphData.put("cardAggDayLabels", aggRepository.findTimestampsByTypeAndPortId(CardAggDay.class, portId));
        cardGraphData.put("cardAggAllData", aggRepository.findValuesByTypeAndPortId(CardAggAll.class, portId));
        cardGraphData.put("cardAggAllLabels", aggRepository.findTimestampsByTypeAndPortId(CardAggAll.class, portId));
        return cardGraphData;

    }



    public List<Portfolio> getAllPublic() {
        return portfolioRepository.findByPublic();
    }

    public List<Long> getPendingCards() {
        return portfolioRepository.getPendingCards();
    }

    public List<Long> getPublicCards() {
        return portfolioRepository.getPublicCards();
    }


    public Page<Portfolio> getPendingPortfolios(
    ) {
        Pageable pageable = PageRequest.of(0, 2000, Sort.by(Sort.Direction.DESC, "creationDate"));

        Specification<Portfolio> specification = (root, query, criteriaBuilder) -> {
            Predicate statusPredicate = criteriaBuilder.equal(root.get("status"), "pending");
            Join<Object, Object> portStocksJoin = root.join("portStocks", JoinType.LEFT);
            Predicate statusPredicate2 = criteriaBuilder.equal(portStocksJoin.get("status"), "pending");
            // Combine all predicates
            return criteriaBuilder.or(statusPredicate, statusPredicate2);
        };

        return portfolioRepository.findAll(specification, pageable);
    }

    public Page<Portfolio> getPublicPortfolios(String searchBy, String searchQuery, String orderBy, String orderDirection, int pageNumber) {
    Sort.Direction direction = "desc".equalsIgnoreCase(orderDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;

    Pageable pageable = PageRequest.of(pageNumber, 2000, Sort.by(direction, orderBy));

    Specification<Portfolio> specification = (root, query, criteriaBuilder) -> {
        Predicate searchPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get(searchBy)), searchQuery.toLowerCase() + "%");

        Predicate statusPredicate = criteriaBuilder.equal(root.get("status"), "public");


        // Combine all predicates
        return criteriaBuilder.and(searchPredicate, statusPredicate);
    };

    return portfolioRepository.findAll(specification, pageable);
}
public List<Long> getPublicPortfolioIds(String searchBy, String searchQuery, String orderBy, String orderDirection, int pageNumber) {
    Sort.Direction direction = "desc".equalsIgnoreCase(orderDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;

    Pageable pageable = PageRequest.of(pageNumber, 2000, Sort.by(direction, orderBy));

    Specification<Portfolio> specification = (root, query, criteriaBuilder) -> {
        Predicate searchPredicate = criteriaBuilder.like(
            criteriaBuilder.lower(root.get(searchBy)), 
            "%" + searchQuery.toLowerCase() + "%"
        );

        Predicate statusPredicate = criteriaBuilder.equal(root.get("status"), "public");

        return criteriaBuilder.and(searchPredicate, statusPredicate);
    };

    return portfolioRepository.findAll(specification, pageable)
            .getContent()
            .stream()
            .map(Portfolio::getId) // Assuming getId() returns Long
            .collect(Collectors.toList());
        }
        

public Page<Portfolio> getPrivatePortfolios(String searchBy, String searchQuery, String orderBy, String orderDirection, int pageNumber) {
    Sort.Direction direction = "desc".equalsIgnoreCase(orderDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;

    Pageable pageable = PageRequest.of(pageNumber, 2000, Sort.by(direction, orderBy));

    Specification<Portfolio> specification = (root, query, criteriaBuilder) -> {
        Predicate searchPredicate = criteriaBuilder.like(root.get(searchBy), searchQuery + "%");

        // Predicate statusPredicate = criteriaBuilder.equal(root.get("status"), "private");


        // Combine all predicates
        return criteriaBuilder.and(searchPredicate);
    };

    return portfolioRepository.findAll(specification, pageable);
}


public List<Portfolio> getProfilePortfolios(long userId) {
    return portfolioRepository.getProfilePortfolios(userId);
}




public List<Long> getPersonalPortfolioIds(
    String searchBy,
    String searchQuery,
    String userId, 
    String orderBy,
    String orderDirection,
    int pageNumber
) {
    Sort.Direction direction = "desc".equalsIgnoreCase(orderDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;

    Pageable pageable = PageRequest.of(pageNumber, 2000, Sort.by(direction, orderBy));

    Specification<Portfolio> specification = (root, query, criteriaBuilder) -> {
        Predicate searchPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get(searchBy)), searchQuery.toLowerCase() + "%");

        // (
        // Predicate statusPredicate = criteriaBuilder.equal(root.get("status"), "private");
        // and
        Predicate authorPredicate = criteriaBuilder.equal(root.get("authorId"), userId);
        // )
        // or
        // (       
        // )
        Predicate andPredicate = criteriaBuilder.and(authorPredicate);

        // Combine all predicates
        return criteriaBuilder.and(searchPredicate, andPredicate);
    };

    return portfolioRepository.findAll(specification, pageable)
            .getContent()
            .stream()
            .map(Portfolio::getId) // Assuming getId() returns Long
            .collect(Collectors.toList());
}




public Page<Portfolio> getPersonalPortfolios(
    String searchBy,
    String searchQuery,
    String userId, 
    String orderBy,
    String orderDirection,
    int pageNumber
) {
    Sort.Direction direction = "desc".equalsIgnoreCase(orderDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;

    Pageable pageable = PageRequest.of(pageNumber, 2000, Sort.by(direction, orderBy));

    Specification<Portfolio> specification = (root, query, criteriaBuilder) -> {
        Predicate searchPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get(searchBy)), searchQuery.toLowerCase() + "%");

        // (
        // Predicate statusPredicate = criteriaBuilder.equal(root.get("status"), "private");
        // and
        Predicate authorPredicate = criteriaBuilder.equal(root.get("authorId"), userId);
        // )
        // or
        // (       
        // )
        Predicate andPredicate = criteriaBuilder.and(authorPredicate);

        // Combine all predicates
        return criteriaBuilder.and(searchPredicate, andPredicate);
    };

    return portfolioRepository.findAll(specification, pageable);
}


public List<PortData> getPortData(Long id, ZonedDateTime date) {
    return portDataRepository.getPortData(id, date);
}



public double getValue(Long id, ZonedDateTime date) {

    Double value = portDataRepository.getValue(id, date);

    if (value == null || Double.isNaN(value)) {
        return 0;
    } else {
        return value;
    }


}

public List<Double> getScoreData(Long id, ZonedDateTime date) {
    return portDataRepository.getScoreData(id, date);
}




public double getScore(Long id, ZonedDateTime date) {

    List<Double> values = portDataRepository.getScoreData(id, date);
    logger.info("Values: " + values.get(0));
    logger.info("Values: " + values.get(values.size()-1));
    if (values.isEmpty() ){
        return 0;
    }
    else{
        return values.get(0)-values.get(values.size()-1);
    }
}



    public List<Long> getUserCards(Long userId) {
        return portfolioRepository.getUserCards(userId);
    }

    public Portfolio save(Portfolio portfolios) {
        return portfolioRepository.save(portfolios);
    }

    public void savePortStock(List<PortStock> portStock) {
        portStockRepository.saveAll(portStock);
    }

    public void deletePortStocks(Long portId) {
        portStockRepository.deleteByPortId(portId);
    }
    public void deletePortData(Long portId) {
        portDataRepository.deleteByPortId(portId);
    }

    public void replacePortStocks(Set<PortStock> portStocks){
        for (PortStock portStock : portStocks) {
            if(portStock.getStatus().equals("active")){
                portStockRepository.delete(portStock);
            }else{
                portStock.setStatus("active");
                portStockRepository.save(portStock);
            }
            
        }
    }

    public void savePortData(List<PortData> portData) {
        portDataRepository.saveAll(portData);
    }

    public Optional<Portfolio> getPortfolioById(Long portfolioId) {
        return portfolioRepository.findById(portfolioId);
    }

    public Portfolio getPortfolioByIdd(Long portfolioId) {
        return portfolioRepository.findById(portfolioId).get();
    }

    public Investment saveInvestment(Investment investment) {
        return investmentRepository.save(investment);
    }

    @Transactional
    public void deletePortfolio(Long id) {
        if (portfolioRepository.existsById(id)) {
            portfolioRepository.deleteById(id);
        } else {
            throw new RuntimeException("Portfolio not found with id " + id);
        }
    }

    @Transactional
    public void deleteTemporaryPortfolios() {
        portfolioRepository.deleteByStatus("temporary");
    }

    public List<Long> getIds() {
        return portfolioRepository.getIds();
    }


    public List<PortStock> getPortStocks(Long portId) {
        return portStockRepository.getPortStocks(portId);
    }

    public List<ZonedDateTime> getChartDataDates(Long portId, ZonedDateTime startDate, String interval) {
        if (interval.equals("month")) {
            return portDataRepository.getChartDataDatesMonth(portId, startDate);
        } else if (interval.equals("hour")) {
            return portDataRepository.getChartDataDatesHour(portId, startDate);
        } else if (interval.equals("minute")) {
            return portDataRepository.getChartDataDatesMinute(portId, startDate);
        } else {
            return portDataRepository.getChartDataDatesDay(portId, startDate);
        }
    }


    public List<Double> getChartDataValues(Long portId, ZonedDateTime startDate, String interval, double ratio) {
        if (interval.equals("month")) {
            return portDataRepository.getChartDataValuesMonth(portId, startDate, ratio);
        } else if (interval.equals("hour")) {
            return portDataRepository.getChartDataValuesHour(portId, startDate, ratio);
        } else if (interval.equals("minute")) {
            return portDataRepository.getChartDataValuesMinute(portId, startDate, ratio);
        } else {
            return portDataRepository.getChartDataValuesDay(portId, startDate, ratio);
        }
    }

    public double getAvgMaxReturn(long userId) {
        Double avgMaxReturn = portfolioRepository.getAvgMaxReturn(userId);
        if (avgMaxReturn == null || Double.isNaN(avgMaxReturn)) {
            return 0;
        } else {
            return avgMaxReturn;
        }
        
    }

}
