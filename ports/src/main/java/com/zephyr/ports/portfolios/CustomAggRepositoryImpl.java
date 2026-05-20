package com.zephyr.ports.portfolios;

import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Repository
public class CustomAggRepositoryImpl implements CustomAggRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public <T extends Agg> List<T> findAllByTypeAndPortId(Class<T> type, Long portId) {
        String jpql = "SELECT a FROM " + type.getSimpleName() + " a WHERE a.portId = :portId ORDER BY timestamp DESC";
        return entityManager.createQuery(jpql, type)
                            .setParameter("portId", portId)
                            .getResultList();
    }

    @Override
    public <T extends Agg> List<Double> findValuesByTypeAndPortId(Class<T> type, Long portId) {
        String jpql = "SELECT a.value FROM " + type.getSimpleName() + " a WHERE a.portId = :portId ORDER BY timestamp DESC";
        return entityManager.createQuery(jpql, Double.class)
                            .setParameter("portId", portId)
                            .getResultList();
    }

    @Override
    public <T extends Agg> List<ZonedDateTime> findTimestampsByTypeAndPortId(Class<T> type, Long portId) {
        String jpql = "SELECT a.timestamp FROM " + type.getSimpleName() + " a WHERE a.portId = :portId ORDER BY timestamp DESC";
        return entityManager.createQuery(jpql, ZonedDateTime.class)
                            .setParameter("portId", portId)
                            .getResultList();
    }




    
}
