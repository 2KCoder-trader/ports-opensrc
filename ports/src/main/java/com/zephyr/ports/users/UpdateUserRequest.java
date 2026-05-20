package com.zephyr.ports.users;

import java.util.List;

import com.vladmihalcea.hibernate.type.array.StringArrayType;

import jakarta.persistence.ElementCollection;


public  class UpdateUserRequest {

    private int money;

    public int getMoney() {
        return money;
    }

    public void setMoney(int money) {
        this.money = money;
    }

    private String username;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

}