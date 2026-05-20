package com.zephyr.ports.portfolios;

import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface PortDataRepository extends JpaRepository<PortData,Long> {

@Query("SELECT pd FROM PortData pd WHERE pd.portId.id = ?1 AND pd.timestamp >= ?2 ORDER BY pd.timestamp DESC")
List<PortData> getPortData(Long portId, ZonedDateTime startDate);

@Query("SELECT pd.value FROM PortData pd WHERE pd.portId.id = ?1 AND pd.timestamp >= ?2 ORDER BY pd.timestamp DESC")
List<Double> getScoreData(Long portId, ZonedDateTime startDate);

@Query("SELECT pd.value FROM PortData pd WHERE pd.portId.id = ?1 AND pd.timestamp = (SELECT MAX(pd.timestamp) FROM PortData pd WHERE pd.timestamp < ?2)")
Double getValue(Long portId, ZonedDateTime timestamp);



@Query("SELECT DISTINCT DATE_TRUNC('month',pd.timestamp) AS timestamp FROM PortData pd WHERE pd.portId.id = ?1 AND timestamp >= ?2 ORDER BY timestamp")
List<ZonedDateTime>  getChartDataDatesMonth(Long portId, ZonedDateTime startDate);

@Query("SELECT DISTINCT DATE_TRUNC('day',pd.timestamp) AS timestamp FROM PortData pd WHERE pd.portId.id = ?1 AND timestamp >= ?2 ORDER BY timestamp")
List<ZonedDateTime>  getChartDataDatesDay(Long portId, ZonedDateTime startDate);

@Query("SELECT DISTINCT DATE_TRUNC('hour',pd.timestamp) AS timestamp FROM PortData pd WHERE pd.portId.id = ?1 AND timestamp >= ?2 ORDER BY timestamp")
List<ZonedDateTime>  getChartDataDatesHour(Long portId, ZonedDateTime startDate);

@Query("SELECT DISTINCT DATE_TRUNC('minute',pd.timestamp) AS timestamp FROM PortData pd WHERE pd.portId.id = ?1 AND timestamp >= ?2 ORDER BY timestamp")
List<ZonedDateTime>  getChartDataDatesMinute(Long portId, ZonedDateTime startDate);

@Query("SELECT AVG(pd.value) * ?3 " +
       "FROM PortData pd " +
       "WHERE pd.portId.id = ?1 AND pd.timestamp >= ?2 " +
       "GROUP BY DATE_TRUNC('month', pd.timestamp) " +
       "ORDER BY DATE_TRUNC('month', pd.timestamp)")
List<Double> getChartDataValuesMonth(Long portId, ZonedDateTime startDate, double ratio);

@Query("SELECT AVG(pd.value) * ?3 " +
       "FROM PortData pd " +
       "WHERE pd.portId.id = ?1 AND pd.timestamp >= ?2 " +
       "GROUP BY DATE_TRUNC('day', pd.timestamp) " +
       "ORDER BY DATE_TRUNC('day', pd.timestamp)")
List<Double> getChartDataValuesDay(Long portId, ZonedDateTime startDate, double ratio);

@Query("SELECT AVG(pd.value) * ?3 " +
       "FROM PortData pd " +
       "WHERE pd.portId.id = ?1 AND pd.timestamp >= ?2 " +
       "GROUP BY DATE_TRUNC('hour', pd.timestamp) " +
       "ORDER BY DATE_TRUNC('hour', pd.timestamp)")
List<Double> getChartDataValuesHour(Long portId, ZonedDateTime startDate, double ratio);

@Query("SELECT AVG(pd.value) * ?3 " +
       "FROM PortData pd " +
       "WHERE pd.portId.id = ?1 AND pd.timestamp >= ?2 " +
       "GROUP BY DATE_TRUNC('minute', pd.timestamp) " +
       "ORDER BY DATE_TRUNC('minute', pd.timestamp)")
List<Double> getChartDataValuesMinute(Long portId, ZonedDateTime startDate, double ratio);


@Modifying
@Transactional
@Query("DELETE FROM PortData pd WHERE pd.portId.id = ?1")
void deleteByPortId(Long portId);




}