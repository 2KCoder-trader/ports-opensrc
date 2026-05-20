package com.zephyr.ports.activity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zephyr.ports.portfolios.Portfolio;
import com.zephyr.ports.users.users;

import jakarta.transaction.Transactional;

@Repository
public interface ActivityRepository extends JpaRepository<Activity,Long>{

@Query("SELECT a FROM Activity a WHERE a.userId = ?1 AND a.portfolioId = ?2 AND a.type != 2")
List<Activity> findSocialInfo(Long userId, Long portId);


@Query("SELECT a FROM Activity a WHERE a.portfolioId = ?1 AND a.type = 2")
List<Activity> getComments(Long portId, int type);

@Query("SELECT a FROM Activity a WHERE a.portfolioId = ?1 AND a.userId = ?2 AND a.type = 0")
Optional<Activity> findLike(Long portId, Long userId);

@Query("SELECT a FROM Activity a WHERE a.portfolioId = ?1 AND a.userId = ?2 AND a.type = 1")
Optional<Activity> findFavorite(Long portId, Long userId);

@Query("SELECT a FROM Activity a WHERE a.portfolioId = ?1 AND a.type = ?2")
List<Activity> getSocialType(Long portId, int type);

@Query("SELECT p FROM Activity a JOIN Portfolio p ON a.portfolioId = p.id WHERE a.userId = ?1 AND a.type = 1")
List<Portfolio> findFavoritesPorts(Long userId);

@Query("SELECT a FROM Activity a WHERE a.portfolioId = ?1 AND a.type = 2")
List<Activity> findPortComments(Long portId);

    public Activity save(Activity activity);

    public void delete(Activity activity);




    
}
