package com.zephyr.ports.portfolios;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long>, JpaSpecificationExecutor<Portfolio>  {

    // @Query( "SELECT p FROM Portfolio p WHERE owner = ?1" )
    // List<Portfolio> FindOwner(String owner);

    Portfolio findById(int portfolioId);

    // @Query( "SELECT p FROM Portfolio p WHERE owner = ?1" )
    // List<Portfolio> findMarket(String market);

    // @Query("SELECT p FROM Portfolio p WHERE p.name = ?1 AND p.author = ?2 AND
    // p.owner = ?3")
    // List<Portfolio> findByNameAndAuthorAndOwner(String name, String author,
    // String owner);
    @Query("SELECT p.id FROM Portfolio p")
    List<Long> getIds();



    // shity comment
    // List<Portfolio> findByRelatedAndOwner(String related, String owner);

    @Query("SELECT p FROM Portfolio p WHERE p.status = 'public'")
    List<Portfolio> findByPublic();

    @Query("SELECT p FROM Portfolio p WHERE p.status IN ('pending', 'edit_pending')")
    List<Portfolio> findByPending();

    @Query("SELECT p FROM Portfolio p WHERE p.status NOT IN ('waiting', 'temporary')")
    List<Portfolio> findNonWaiting();

    @Query("SELECT p FROM Portfolio p WHERE p.status = 'waiting'")
    List<Portfolio> findWaiting();

    @Modifying
    @Transactional
    @Query("DELETE FROM Portfolio p WHERE p.status = :status")
    void deleteByStatus(@Param("status") String status);

   
//  @Query("SELECT DISTINCT p FROM Portfolio p JOIN p.portStocks ps WHERE ps.status = 'pending'")
    // List<Portfolio> getEditPortfolios();




    
    @Query("SELECT AVG(p.maxReturn) FROM Portfolio p WHERE authorId = ?1 AND status = 'public'")
    Double getAvgMaxReturn(long userId);


    @Query("SELECT p FROM Portfolio p WHERE p.authorId = ?1 AND p.status = 'public'")
    List<Portfolio> getProfilePortfolios(long userId);

    // @Modifying(clearAutomatically = true)
    // @Transactional
    // @Query("update Portfolio p set p.pnlHist = ?1, p.dateHist = ?2, p.curRisk =
    // ?3, p.curPercentages = ?4 where p.portfolioId = ?5")
    // int updatePortfolio(
    // List<String> pnlHist,
    // List<String> dateHist,
    // double curRisk,
    // List<String> curPercentages,
    // int portfolioId
    // );

    // @Modifying(clearAutomatically = true)
    // @Transactional
    // @Query("UPDATE Portfolio p SET p.pnlHist = :pnlHist, p.shares = :shares,
    // p.avgPrices = :avgPrices WHERE p.portfolioId = :portfolioId AND p.owner =
    // :owner")
    // int updatePortfolioPnlAndSharesAndPrices(@Param("pnlHist") List <String>
    // pnlHist,
    // @Param("shares") List <String> shares,
    // @Param("avgPrices") List <String> avgPrices,
    // @Param("portfolioId") int portfolioId,
    // @Param("owner") String owner);

    // insert portfolio

    // @Query(value = """
    //     SELECT p.id 
    //     FROM Portfolio p 
    //     WHERE p.status = :status AND p.author.id = :userId AND p.:searchBy LIKE CONCAT('%', :searchQuery, '%')
    //     ORDER BY p.:orderBy""")
    // Page<Portfolio> findPortfolioIds(
    //     @Param("searchBy") String searchBy,
    //     @Param("searchQuery") String searchQuery,
    //     @Param("status") String status,
    //     @Param("orderBy") String orderBy,
    //     @Param("userId") String userId,
    //     Pageable pageable);


    @Query("""
               SELECT
                   p.id
               FROM Portfolio p WHERE p.status = 'public'
            """)
    List<Long> getPublicCards();

@Query("""
        SELECT
            p.id
        FROM Portfolio p WHERE p.status = 'pending'
     """)
List<Long> getPendingCards();
@Query("""
        SELECT
            p.id
        FROM Portfolio p WHERE p.authorId= ?1 AND NOT p.status = 'creating'
     """)
List<Long> getUserCards(long userId);
}