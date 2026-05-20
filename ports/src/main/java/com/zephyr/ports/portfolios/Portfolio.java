                package com.zephyr.ports.portfolios;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.zephyr.ports.users.users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import reactor.core.publisher.Sinks.One;

@Entity
@Table(name = "portfolios",schema = "ports")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Portfolio {
 

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    // @ManyToOne
    // @JoinColumn(name = "author", referencedColumnName = "id")
    // private users author;

    @Column(name = "author_name")
    private String authorName;
    @Column(name = "author_id")
    private Long authorId;

    private String description;
    private String sector;
    @Column(name = "risk")
    private Double risk;

    @Column(name = "favorite_status")
    private boolean favoriteStatus = false;
    @Column(name = "like_status")
    private boolean likeStatus = false;


    @Column(name = "creation_date")
    private ZonedDateTime creationDate;
    @Column(name = "publish_date")
    private ZonedDateTime publishDate;
    @Column(name = "last_rebalance_date")
    private ZonedDateTime lastRebalanceDate;
    @Column(name = "expense_ratio")
    private Double expenseRatio;
    private String status;
    @Column(name = "daily_pnl")
    private double dailyPnl;
    @Column(name = "last_value")
    private double lastValue;
    @Column(name = "annual_return")
    private double annualReturn;
    @Column(name = "max_return")
    private double maxReturn = 0.0;

    @Column(name = "investment_date")
    private ZonedDateTime investmentDate;

    // @OneToMany(mappedBy = "portId")
    // @JsonManagedReference
    // private Set<PortStock> portStocks;

    private List<Double> cardValues;

    private List<ZonedDateTime> cardDates;


    private double ratio = 0.0;

    @Column(name = "sharpe_ratio")
    private double sharpeRatio = 0.0;



    @Column(name = "max_drawdown")
    private double maxDrawdown = 0.0;

    @Column(name = "total_pnl")
    private double totalPnL = 0.0;

    private double reserve = 0.0;


    @Column(name = "previous_close")
    private double previousClose = 0.0;

    private double open = 0.0;

    private double high = 0.0;

    private double low = 0.0;

    private int views = 0;
    
    private double investors = 0;





    public ZonedDateTime getInvestmentDate() {
        return investmentDate;
    }

    public void setInvestmentDate(ZonedDateTime investmentDate) {
        this.investmentDate = investmentDate;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }
    // public users getAuthor() {
    //     return author;
    // }
    // public void setAuthor(users author) {
    //     this.author = author;
    // }


    public List<Double> getCardValues() {
        return cardValues;
    }
    public void setCardValues(List<Double> cardValues) {
        this.cardValues = cardValues;
    }
    public List<ZonedDateTime> getCardDates() {
        return cardDates;
    }
    public void setCardDates(List<ZonedDateTime> cardDates) {
        this.cardDates = cardDates;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public double getInvestors() {
        return investors;
    }

    public void setInvestors(double investors) {
        this.investors = investors;
    }

    public double getTotalInvested() {
        return totalInvested;
    }

    public void setTotalInvested(double totalInvested) {
        this.totalInvested = totalInvested;
    }

    private double totalInvested = 0;

    public double getPreviousClose() {
        return previousClose;
    }

    public void setPreviousClose(double previousClose) {
        this.previousClose = previousClose;
    }

    public double getOpen() {
        return open;
    }

    public void setOpen(double open) {
        this.open = open;
    }

    public double getHigh() {
        return high;
    }

    public void setHigh(double high) {
        this.high = high;
    }

    public double getLow() {
        return low;
    }

    public void setLow(double low) {
        this.low = low;
    }


    public double getSharpeRatio() {
        return sharpeRatio;
    }

    public void setSharpeRatio(double sharpeRatio) {
        this.sharpeRatio = sharpeRatio;
    }

    public double getMaxDrawdown() {
        return maxDrawdown;
    }

    public void setMaxDrawdown(double maxDrawdown) {
        this.maxDrawdown = maxDrawdown;
    }

    public double getTotalPnL() {
        return totalPnL;
    }

    public void setTotalPnL(double totalPnL) {
        this.totalPnL = totalPnL;
    }
  
    public void setReserve(double reserve){
        this.reserve = reserve;
    }

    public double getReserve(){
        return reserve;
    }

    
    // public Set<PortStock> getPortStocks() {
    //     return portStocks;
    // }

    public double getMaxReturn() {
        return maxReturn;
    }
    public void setMaxReturn(double maxReturn) {
        this.maxReturn = maxReturn;
    }
    
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getSector() {
        return sector;
    }
    public void setSector(String sector) {
        this.sector = sector;
    }
    public void setRisk(Double risk) {
        this.risk = risk;
    }
    public Double getRisk() {
        return risk;
    }
    public ZonedDateTime getCreationDate() {
        return creationDate;
    }
    public void setCreationDate(ZonedDateTime creationDate) {
        this.creationDate = creationDate;
    }
    public ZonedDateTime getLastRebalanceDate() {
        return lastRebalanceDate;
    }
    public void setLastRebalanceDate(ZonedDateTime lastRebalanceDate) {
        this.lastRebalanceDate = lastRebalanceDate;
    }
    public Double getExpenseRatio() {
        return expenseRatio;
    }
    public void setExpenseRatio(Double expenseRatio) {
        this.expenseRatio = expenseRatio;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public ZonedDateTime getPublishDate() {
        return publishDate;
    }
    public void setPublishDate(ZonedDateTime publishDate) {
        this.publishDate = publishDate;
    }

    public double getDailyPnl() {
        return dailyPnl;
    }
    public void setDailyPnl(double dailyPnl) {
        this.dailyPnl = dailyPnl;
    }
    public double getLastValue() {
        return lastValue;
    }
    public void setLastValue(double lastValue) {
        this.lastValue = lastValue;
    }
    public double getAnnualReturn() {
        return annualReturn;
    }
    public void setAnnualReturn(double annualReturn) {
        this.annualReturn = annualReturn;
    }

    @Override
    public int hashCode() {
        int hash = 5;
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final Portfolio other = (Portfolio) obj;
        return true;
    }

    public double getRatio() {
        return ratio;
    }

    public void setRatio(double ratio) {
        this.ratio = ratio;
    }

    public int getViews() {
        return views;
    }

    public void setViews(int views) {
        this.views = views;
    }

    public boolean isFavoriteStatus() {
        return favoriteStatus;
    }

    public void setFavoriteStatus(boolean favoriteStatus) {
        this.favoriteStatus = favoriteStatus;
    }

    public boolean isLikeStatus() {
        return likeStatus;
    }

    public void setLikeStatus(boolean likeStatus) {
        this.likeStatus = likeStatus;
    }

}
