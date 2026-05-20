package com.zephyr.ports.portfolios;
import java.time.ZonedDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.zephyr.ports.stocks.Stock;

import jakarta.persistence.*;


@Entity
@Table(name = "port_stocks", schema = "ports")
public class PortStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @ManyToOne
    // @JsonBackReference
    // @JoinColumn(name = "port_id", referencedColumnName = "id")
    @Column(name = "port_id")
    private Long portId;
    
    // @ManyToOne
    // @JoinColumn(name = "stock_id_ticker", referencedColumnName = "ticker")
    @ManyToOne
    @JoinColumn(name = "stock_id_ticker", referencedColumnName = "ticker")
    private Stock stockId;


    public void setPortId(Long portId) {
        this.portId = portId;
    }



    @Column(name = "shares")
    private double share;

    @Column(name = "average_price")
    private double avgPrice;

    @Column(name = "init_percentage")
    private double initPerc;

    @Column(name = "cur_percentage")
    private double curPerc;

    private String status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPortId() {
        return portId;
    }


    public Stock getStockId() {
        return stockId;
    }

    public void setStockId(Stock stockId) {
        this.stockId = stockId;
    }

    public double getShare() {
        return share;
    }

    public void setShare(double share) {
        this.share = share;
    }

    public double getAvgPrice() {
        return avgPrice;
    }

    public void setAvgPrice(double avgPrice) {
        this.avgPrice = avgPrice;
    }

    public double getInitPerc() {
        return initPerc;
    }

    public void setInitPerc(double initPerc) {
        this.initPerc = initPerc;
    }

    public double getCurPerc() {
        return curPerc;
    }

    public void setCurPerc(double curPerc) {
        this.curPerc = curPerc;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    

}
