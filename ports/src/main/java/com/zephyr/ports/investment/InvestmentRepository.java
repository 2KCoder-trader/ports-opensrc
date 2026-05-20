package com.zephyr.ports.investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.zephyr.ports.portfolios.Portfolio;

import java.util.*;
import jakarta.transaction.Transactional;

@Repository
public interface InvestmentRepository  extends JpaRepository<Investment,Long>, JpaSpecificationExecutor<Investment>{


    //shitty comment
    @Query("SELECT i FROM Investment i JOIN FETCH i.portfolio p WHERE i.user.id = ?1")
    List<Investment> findInvestmentsPortsByUserId(Long userId);
    
    @Query("SELECT i FROM Investment i JOIN FETCH i.portfolio p WHERE i.user.id = ?1 AND i.portfolio.id = ?2")
    Investment findInvestmentsByUserIdAndPortfolioid(Long userId,Long portfolioId);

    @Query("SELECT i FROM Investment i WHERE i.user.id = ?1 AND i.portfolio.id = ?2")
    Optional<Investment> findInvestmentByIdAndPortId(Long userId, Long portId);


    @Query("SELECT i.id FROM Investment i WHERE i.portfolio.id = :portfolioId")
    Long findInvestmentIdsByPortfolioId(Long portfolioId);

    @Query("SELECT i FROM Investment i WHERE i.user.id = ?1")
    List<Investment> findInvestmentsByUserId(Long userId);

    @Query("SELECT i.portfolio FROM Investment i WHERE i.user.id = ?1")
    List<Portfolio> findPortsByUserId(Long userId);

    @Query("SELECT i FROM Investment i WHERE i.portfolio = ?1 AND i.reserve != 0")
    List<Investment> findReservedInvestments(Portfolio portfolio);

    @Query("SELECT i FROM Investment i WHERE i.portfolio.id = ?1")
    List<Investment> findInvestmentsByPortId(Long portId);


    @Modifying
    @Transactional
    @Query("DELETE FROM Investment i WHERE i.portfolio.id = :portfolioId")
    void deleteByPortId(Long portfolioId);



    @Query("SELECT i.portfolio FROM Investment i WHERE i.user.id = ?1 AND i.portfolio.title LIKE ?2% ORDER BY i.portfolio.title")
    List<Portfolio> findPortfoliosByUserAndSearchQueryOrderByTitle(String userId, String searchQuery, String orderDirection);

    @Query("SELECT i.portfolio FROM Investment i WHERE i.user.id = ?1 AND i.portfolio.title LIKE ?2% ORDER BY i.portfolio.lastValue")
    List<Portfolio> findPortfoliosByUserAndSearchQueryOrderByLastValue(String userId, String searchQuery, String orderDirection);

    @Query("SELECT i.portfolio FROM Investment i WHERE i.user.id = ?1 AND i.portfolio.title LIKE ?2% ORDER BY i.portfolio.risk")
    List<Portfolio> findPortfoliosByUserAndSearchQueryOrderByRisk(String userId, String searchQuery, String orderDirection);

    @Query("SELECT i.portfolio FROM Investment i WHERE i.user.id = ?1 AND i.portfolio.title LIKE ?2% ORDER BY i.portfolio.dailyPnl")
    List<Portfolio> findPortfoliosByUserAndSearchQueryOrderByDailyPnl(String userId, String searchQuery, String orderDirection);

}


