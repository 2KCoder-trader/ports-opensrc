package com.zephyr.ports.portfolios;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface AggRepository extends JpaRepository<Agg, Long>, CustomAggRepository {

}
