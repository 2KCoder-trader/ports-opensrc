package com.zephyr.ports.users;
import jakarta.persistence.*;

import java.util.Collection;
import java.util.HashSet;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.zephyr.ports.investment.Investment;
import com.zephyr.ports.portfolios.Portfolio;

import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users",schema = "ports")
public class users implements UserDetails{
    

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String username;

    private String password;
    private String email;


    private double money;

    private String Linkedin;

    private double avgMaxReturn = 0.0;

    private double invested = 0.0;

    private double totalBalance = 0.0;

 

    public double getTotalBalance() {
        return totalBalance;
    }
    public void setTotalBalance(double totalBalance) {
        this.totalBalance = totalBalance;
    }
    public double getAvgMaxReturn() {
        return avgMaxReturn;
    }
    public void setAvgMaxReturn(double avgMaxReturn) {
        this.avgMaxReturn = avgMaxReturn;
    }
    private String verificationCode;
    
    public String getVerificationCode() {
        return verificationCode;
    }
    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }
    private boolean active;

    private String bio;


    private byte [] profile_image;



    @ManyToMany
    @JoinTable(
        name = "user_tags",
        schema = "ports",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
   @JsonIgnoreProperties("users")
    private Set<Tags> tags ;


    // @OneToMany(mappedBy = "user")
    // private Set<Investment> investments;

    // @OneToMany(mappedBy = "author")
    // private Set<Portfolio> portfolios;


    // public Set<Investment> getInvestments() {
    //     return investments;
    // }
    // public Set<Portfolio> getPortfolios() {
    //     return portfolios;
    // }

    
    public double getInvested() {
        return invested;
    }
    public void setInvested(double invested) {
        this.invested = invested;
    }
    public boolean isActive() {
        return active;
    }
    public void setActive(boolean active) {
        this.active = active;
    }

    public long getId() {
        return id;
    }
    public void setId(long id) {
        this.id = id;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public double getMoney() {
        return money;
    }
    public void setMoney(double money) {
        this.money = money;
    }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }
    public Set<Tags> getTags() {
            if (tags == null) {  // Defensive check
            tags = new HashSet<>();
        }
        return tags;
    }



    public byte[] getProfile_image() {
        return profile_image;
    }
    public void setProfile_image(byte[] profile_image) {
        this.profile_image = profile_image;
    }
    public String getBio() {
        return bio;
    }
    public void setBio(String bio) {
        this.bio = bio;
    }
    public String getLinkedin() {
        return Linkedin;
    }
    public void setLinkedin(String linkedin) {
        Linkedin = linkedin;
    }

    

}
