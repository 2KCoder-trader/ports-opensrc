
package com.zephyr.ports.stocks;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface MarketStatusRepository   extends JpaRepository<MarketStatus,Long>{

    //shitty comment
    @Query("SELECT ms FROM MarketStatus ms WHERE ms.id = 0")
    MarketStatus getMarketStatus();

    @Query("SELECT ms.startDate FROM MarketStatus ms WHERE ms.id = 0")
    List<ZonedDateTime> getMarketStartDate();

    @Query("SELECT ms.closeDate FROM MarketStatus ms WHERE ms.id = 0")
    ZonedDateTime getMarketEndDate();
}
