package com.zephyr.ports.users;

import org.checkerframework.checker.units.qual.C;

import jakarta.persistence.*;

@Entity
@Table(name = "user_tags", schema = "ports")
public class UserTags {
    
    
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private long id;


    @Column(name = "user_id")
    private long userId;


    @Column(name = "tag_id")
    private long tagId;

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public long getUserId() {
        return userId;
    }
    public void setUserId(long userId) {
        this.userId = userId;
    }
    public long getTagId() {
        return tagId;
    }
    public void setTagId(long tagId) {
        this.tagId = tagId;
    }
}

