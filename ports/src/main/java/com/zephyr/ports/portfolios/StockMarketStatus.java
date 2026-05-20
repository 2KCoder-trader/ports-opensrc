package com.zephyr.ports.portfolios;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public class StockMarketStatus {

    private static final ZoneId ZONE_ID = ZoneId.of("America/New_York");
    private static final LocalTime MARKET_OPEN = LocalTime.of(9, 30);
    private static final LocalTime MARKET_CLOSE = LocalTime.of(16, 0);

    public static boolean isMarketOpen() {
        ZonedDateTime now = ZonedDateTime.now(ZONE_ID);
        DayOfWeek dayOfWeek = now.getDayOfWeek();
        LocalTime currentTime = now.toLocalTime();
        // Check if today is a weekday
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            return false;
        }

        // Check if current time is within market hours
        return !currentTime.isBefore(MARKET_OPEN) && !currentTime.isAfter(MARKET_CLOSE);
    }

    public static void main(String[] args) {
        if (isMarketOpen()) {
            System.out.println("The stock market is open.");
        } else {
            System.out.println("The stock market is closed.");
        }
    }
}