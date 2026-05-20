package com.zephyr.ports.portfolios;

import java.time.ZonedDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class Agg {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "port_id")
    private Long portId;

    @Column(name = "value")
    private double value;
    @Column(name = "timestamp", columnDefinition = "TIMESTAMPTZ")
    private ZonedDateTime timestamp;

    public Long getPortId() {
        return portId;
    }

    public double getValue() {
        return value;
    }
    public ZonedDateTime getTimestamp() {
        return timestamp;
    }
    public void setPortId(Long portId) {
        this.portId = portId;
    }
    public void setValue(double value) {
        this.value = value;
    }
    public void setTimestamp(ZonedDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
