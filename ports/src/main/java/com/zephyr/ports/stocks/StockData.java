package com.zephyr.ports.stocks;
import java.time.ZonedDateTime;

import jakarta.persistence.*;


@Entity
@Table(name = "stock_data", schema = "ports")
public class StockData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    


    // @Column(name = "stock_id_ticker")
    private String ticker;

    @Column(name = "price")
    private double price;
    @Column(name = "timestamp", columnDefinition = "TIMESTAMPTZ")
    private ZonedDateTime timestamp;


    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public String getTicker() {
        return ticker;
    }

    public void setPrice(double price) {
        this.price = price;
    }
    public void setTimestamp(ZonedDateTime timestamp) {
        this.timestamp = timestamp;
    }
    public double getPrice() {
        return price;
    }
    public ZonedDateTime getTimestamp() {
        return timestamp;
    }


}
