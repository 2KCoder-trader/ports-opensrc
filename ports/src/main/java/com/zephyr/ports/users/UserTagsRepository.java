package com.zephyr.ports.users;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserTagsRepository extends JpaRepository<UserTags, Long> {

    List<UserTags> findByUserId(long userId);


}