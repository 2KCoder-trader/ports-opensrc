package com.zephyr.ports.investment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.zephyr.ports.portfolios.Portfolio;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@Service
public class InvestmentService {
    private static final Logger logger = LoggerFactory.getLogger(InvestmentService.class);

    @Autowired
    InvestmentRepository investmentRepository;
    
      public Investment invest(Investment investment) {
        logger.debug("investment.toString()");
        return investmentRepository.save(investment);
    }

    public List<Investment> getAllInvestments() {
      return investmentRepository.findAll();
    }

    
    // @Transactional
    // public void delle() {
    //     // Step 1: Retrieve investment IDs based on the portfolio ID

    //     // Step 2: Delete the specific investment
    //     investmentRepository.deleteByInvestmentId("temporary");
    // }

    @Transactional
    public void dellee(Long portId) {
        // Step 1: Retrieve investment IDs based on the portfolio ID
        // Step 2: Delete the specific investment
        investmentRepository.deleteByPortId(portId);
    }

    public Investment saveInvestment(Investment investment) {
      logger.debug("In service Saving investment: {}", investment);
      return investmentRepository.save(investment);
  }
    public List<Investment> findInvestmentsPortsByUserId(Long user_id) {
      return investmentRepository.findInvestmentsPortsByUserId(user_id);
    }
    public Investment getSiInvest(Long user_id, Long portfolio_id) {
      return investmentRepository.findInvestmentsByUserIdAndPortfolioid(user_id,portfolio_id);
    }
    public Optional<Investment> findInvestmentByUserIdAndPortId(Long userId, Long portId) {
      return investmentRepository.findInvestmentByIdAndPortId(userId, portId);
  }

    public void deleteInvestment(Investment existingInvestment) {
      investmentRepository.delete(existingInvestment);
    }

    public List<Portfolio> findPortsByUserId(Long userId) {
      return investmentRepository.findPortsByUserId(userId);
    }
    public List<Investment> findInvestmentsByPortId(Long portId) {
      return investmentRepository.findInvestmentsByPortId(portId);
    }

    public List<Investment> findReservedInvestments(Portfolio port){
      return investmentRepository.findReservedInvestments(port);
    }
        public Page<Investment> getInvestments(
    String searchBy,
    String searchQuery,
    String userId,
    String orderBy,
    String orderDirection,
    int pageNumber
) {
    Sort.Direction direction = "desc".equalsIgnoreCase(orderDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;

    Pageable pageable = PageRequest.of(pageNumber, 2000, Sort.by(direction, "portfolio."+orderBy));

    Specification<Investment> specification = (root, query, criteriaBuilder) -> {
        Predicate searchPredicate = criteriaBuilder.like(root.get("portfolio").get(searchBy), searchQuery + "%");


        Predicate userPredicate = userId != null
            ? criteriaBuilder.equal(root.get("user").get("id"), userId)
            : criteriaBuilder.conjunction();

        // Combine all predicates
        return criteriaBuilder.and(searchPredicate, userPredicate);
    };

    return investmentRepository.findAll(specification, pageable);
}

public List<Portfolio> getInvestedPortfolios(
        String searchBy,
        String searchQuery,
        String userId,
        String orderBy,
        String orderDirection,
        int pageNumber
    ) {
        Sort.Direction direction = "desc".equalsIgnoreCase(orderDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;

        if (orderBy == "title"){
          return investmentRepository.findPortfoliosByUserAndSearchQueryOrderByTitle(userId, searchQuery, direction.name());
        } else if(orderBy == "lastValue"){
          return investmentRepository.findPortfoliosByUserAndSearchQueryOrderByLastValue(userId, searchQuery, direction.name());
        } else if(orderBy == "risk"){
          return investmentRepository.findPortfoliosByUserAndSearchQueryOrderByRisk(userId, searchQuery, direction.name());
        } else if(orderBy == "dailyPnl"){
          return investmentRepository.findPortfoliosByUserAndSearchQueryOrderByDailyPnl(userId, searchQuery, direction.name());
        }

        // Adjust the query parameters as needed
        return null;
    }


    @PersistenceContext
    private EntityManager entityManager;

    public List<Portfolio> getPortfolios(
        String searchBy,
        String searchQuery,
        String userId,
        String orderBy,
        String orderDirection,
        int pageNumber
    ) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Portfolio> criteriaQuery = criteriaBuilder.createQuery(Portfolio.class);
        Root<Investment> investmentRoot = criteriaQuery.from(Investment.class);
        Join<Investment, Portfolio> portfolioJoin = investmentRoot.join("portfolio");

        criteriaQuery.select(portfolioJoin);

        Predicate searchPredicate = criteriaBuilder.like(
            criteriaBuilder.lower(portfolioJoin.get(searchBy)),
            "%" + searchQuery.toLowerCase() + "%"
        );
        Predicate userPredicate = criteriaBuilder.equal(investmentRoot.get("user").get("id"), userId);

        criteriaQuery.where(criteriaBuilder.and(searchPredicate, userPredicate));

        Sort.Direction direction = "desc".equalsIgnoreCase(orderDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
        if (direction == Sort.Direction.ASC) {
            criteriaQuery.orderBy(criteriaBuilder.asc(portfolioJoin.get(orderBy)));
        } else {
            criteriaQuery.orderBy(criteriaBuilder.desc(portfolioJoin.get(orderBy)));
        }

        List<Portfolio> portfolios = entityManager.createQuery(criteriaQuery).getResultList();
        return portfolios;
    }


}
