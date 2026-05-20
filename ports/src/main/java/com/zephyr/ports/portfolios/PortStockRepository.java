package com.zephyr.ports.portfolios;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface PortStockRepository extends JpaRepository<PortStock,Long> {

@Query("SELECT ps FROM PortStock ps WHERE ps.portId = ?1")
List<PortStock> getPortStocks(Long portId);

    @Modifying
    @Transactional
    @Query("DELETE FROM PortStock ps WHERE ps.portId = ?1")
    void deleteByPortId(Long portId);


}