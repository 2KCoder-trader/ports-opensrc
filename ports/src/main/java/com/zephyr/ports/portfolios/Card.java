package com.zephyr.ports.portfolios;

public interface Card {
    String getTitle();
    String getStatus();
    String getAuthor();
    Double getLastValue();
    Double getDailyPnL();
    Double getAnnualReturn();
    Double getRisk();
    Long getId();
}
