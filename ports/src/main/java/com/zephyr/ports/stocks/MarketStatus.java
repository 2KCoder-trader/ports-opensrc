package com.zephyr.ports.stocks;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "market_status", schema = "ports")

public class MarketStatus {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @Column(name = "is_market_open")
    private boolean isMarketOpen;
    @Column(name = "start_date")
    private ZonedDateTime startDate;
    @Column(name = "close_date")
    private ZonedDateTime closeDate;

    @Column(name = "previous_close_date")
    private ZonedDateTime previousCloseDate;

    public long getId() {
        return id;
    }
    public boolean isMarketOpen() {
        return isMarketOpen;
    }
    public ZonedDateTime getStartDate() {
        return startDate;
    }
    public ZonedDateTime getCloseDate() {
        return closeDate;
    }
    public ZonedDateTime getPreviousCloseDate() {
        return previousCloseDate;
    }
    

}
