package com.zephyr.ports.stocks;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "stocks", schema = "ports")
public class Stock {




    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stock_id")
    private long stockId;
    //  need to make changes to this in sql 
    // @Id
    // @Type(type = "string-array") 
    @Column(name = "ticker")
    // @Column(name = "ticker")
    private String ticker;



    @Column(name = "change")
    private double change;
    @Column(name = "last_price")
    private double lastPrice;
    private int volume;
    @Column(name = "full_name")
    private String fullName;
    
    @Column(name = "sector")
    private String sector;
    


    public String getSector() {
        return sector;
    }


    public void setSector(String sector) {
        this.sector = sector;
    }


    public long getStockId() {
        return stockId;
    }


    public String getTicker() {
        return ticker;
    }


    public double getDailyChange() {
        return change;
    }


    public double getPrice() {
        return lastPrice;
    }


    public int getVolume() {
        return volume;
    }


    public void setTicker(String ticker) {
        this.ticker = ticker;
    }


    public void setChange(double change) {
        this.change = change;
    }


    public void setLastPrice(double lastPrice) {
        this.lastPrice = lastPrice;
    }


    public void setVolume(int volume) {
        this.volume = volume;
    }
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }



    public String getFullName() {
        return fullName;
    }


    public void setStockId(long stockId) {
        this.stockId = stockId;
    }

    

}
