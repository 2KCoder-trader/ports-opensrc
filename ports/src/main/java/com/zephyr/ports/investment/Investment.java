package com.zephyr.ports.investment;

import java.time.ZonedDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.zephyr.ports.portfolios.Portfolio;
import com.zephyr.ports.users.users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "investments",schema = "ports")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Investment {
    public Investment() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "creation_date")
    private ZonedDateTime creationDate;

    @Column(name = "last_investment_date")
    private ZonedDateTime lastInvestmentDate;


    @ManyToOne
    @JoinColumn(name = "portfolio_id", referencedColumnName = "id")
    private Portfolio portfolio;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private users user;
    
    @Column(name = "investment")
    private double investmentAmount = 0;

    @Column(name = "market_value")
    private double marketPortValue = -1;

    @Column(name = "is_closing")
    private Boolean isClosing;

    private double reserve = 0;


    private double ratio = 0;
    
    public users getUser() {
        return user;
    }
    public Boolean getIsClosing(){
        return isClosing;
    }
    public void setIsClosing(Boolean isClosing){
        this.isClosing = isClosing;
    }


    public double getReserve() {
        return reserve;
    }

    public void setReserve(double reserve) {
        this.reserve = reserve;
    }
    public void setUser(users user) {
        this.user = user;
    }


    public Portfolio getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(Portfolio portfolio) {
        this.portfolio = portfolio;
    }


    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public ZonedDateTime getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(ZonedDateTime creationDate) {
        this.creationDate = creationDate;
    }

    public ZonedDateTime getLastInvestmentDate() {
        return lastInvestmentDate;
    }

    public void setLastInvestmentDate(ZonedDateTime lastInvestmentDate) {
        this.lastInvestmentDate = lastInvestmentDate;
    }


    public Double getInvestmentAmount() {
        return investmentAmount;
    }


    public void setInvestmentAmount(Double investmentAmount) {
        this.investmentAmount = investmentAmount;
    }
    public Double getMarketPortValue() {
        return marketPortValue;
    }
    public void setMarketPortValue(Double marketPortValue) {
        this.marketPortValue = marketPortValue;
    }
    public Double getRatio() {
        return ratio;
    }
    public void setRatio(Double ratio) {
        this.ratio = ratio;
    }
}



// a tool that could rate give it a seed germination score (something like that ) thresholds of seed germination 

//come up with factrs and then rank them understand them and trhen go it 

// seed type vs lot 

// cant remember exact protocool. test 200 seeds and every seed is different 

// only thinking abouit corn but make a psohne call seeing if we can do soybean 

// dtn (data source)

// presentation each week for each individuals 
                                                                                                                

// talk about visit to becks hybrid 