package com.zephyr.ports.portfolios;
import java.time.ZonedDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;


@Entity
@Table(name = "port_data", schema = "ports")
public class PortData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "port_id", referencedColumnName = "id")
    private Portfolio portId;

    @Column(name = "value")
    private double value;
    @Column(name = "timestamp", columnDefinition = "TIMESTAMPTZ")
    private ZonedDateTime timestamp;

    public PortData(Long id, Portfolio portId, ZonedDateTime timestamp, double value) {
        this.id = id;
        this.portId = portId;
        this.timestamp = timestamp;
        this.value = value;
    }
    public PortData() {
        
    }
    public Portfolio getPortId() {
        return portId;
    }
    public void setPortId(Portfolio portId) {
        this.portId = portId;
    }
    public double getValue() {
        return value;
    }
    public void setValue(double value) {
        this.value = value;
    }
    public ZonedDateTime getTimestamp() {
        return timestamp;
    }
    public void setTimestamp(ZonedDateTime timestamp) {
        this.timestamp = timestamp;
    }


}
