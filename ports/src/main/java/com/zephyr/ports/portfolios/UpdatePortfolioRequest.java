package com.zephyr.ports.portfolios;

import java.util.List;

import com.vladmihalcea.hibernate.type.array.StringArrayType;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.ElementCollection;


public  class UpdatePortfolioRequest {


    @Convert(attributeName = "pnl_hist", converter = StringArrayType.class)
    @Column(name = "pnl_hist", columnDefinition = "text[]")
    private List <String>  pnlHist;


    @Convert(attributeName = "date_hist", converter = StringArrayType.class)
    @Column(name = "date_hist", columnDefinition = "text[]")
    private List <String>  dateHist;

    private Double curRisk;


    @Convert(attributeName = "cur_percentages", converter = StringArrayType.class)
    @Column(name = "cur_percentages", columnDefinition = "text[]")
    private List <String>  curPercentages;


    private int portfolioId;
    private String owner;

    @Convert(attributeName = "shares", converter = StringArrayType.class)
    @Column(name = "shares", columnDefinition = "text[]")
    private List <String>  shares;

    
    @Convert(attributeName = "avg_prices", converter = StringArrayType.class)
    @Column(name = "avg_prices", columnDefinition = "text[]")
    private List <String>  avgPrices;


    
    public List<String> getPnlHist() {
        return pnlHist;
    }



    public void setPnlHist(List<String> pnlHist) {
        this.pnlHist = pnlHist;
    }
    public List<String> getDateHist() {
        return dateHist;
    }
    public void setDateHist(List<String> dateHist) {
        this.dateHist = dateHist;
    }
    public Double getCurRisk() {
        return curRisk;
    }
    public void setCurRisk(Double curRisk) {
        this.curRisk = curRisk;
    }
    public List<String> getCurPercentages() {
        return curPercentages;
    }
    public void setCurPercentages(List<String> curPercentages) {
        this.curPercentages = curPercentages;
    }
    public int getPortfolioId() {
        return portfolioId;
    }
    public void setPortfolioId(int portfolioId) {
        this.portfolioId = portfolioId;
    }
    public String getOwner() {
        return owner;
    }
    public void setOwner(String owner) {
        this.owner = owner;
    }
    public List<String> getShares() {
        return shares;
    }
    public void setShares(List<String> shares) {
        this.shares = shares;
    }
    public List<String> getAvgPrices() {
        return avgPrices;
    }
    public void setAvgPrices(List<String> avgPrices) {
        this.avgPrices = avgPrices;
    }

}