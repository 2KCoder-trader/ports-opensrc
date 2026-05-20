package com.zephyr.ports.portfolios;

import java.time.ZonedDateTime;
import java.util.List;

public interface CustomAggRepository {
    <T extends Agg> List<T> findAllByTypeAndPortId(Class<T> type, Long portId);
    <T extends Agg> List<Double> findValuesByTypeAndPortId(Class<T> type, Long portId);
    <T extends Agg> List<ZonedDateTime> findTimestampsByTypeAndPortId(Class<T> type, Long portId);
}
