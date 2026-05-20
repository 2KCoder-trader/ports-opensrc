package com.zephyr.ports.users;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TagRepository extends JpaRepository<Tags, Long> {
    Tags findByName(String name);

    @Query("SELECT t.name FROM Tags t WHERE t.type = 'college'")
    List<String> getClubs();

    @Query("SELECT t FROM Tags t WHERE t.id = ?1")
    Tags findByTagId(long tagId);


}