package com.zephyr.ports.users;

import java.io.IOException;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.zephyr.ports.portfolios.Portfolio;
import com.zephyr.ports.investment.InvestmentRepository;
import com.zephyr.ports.investment.Investment;
import com.zephyr.ports.portfolios.PortfolioRepository;
import jakarta.persistence.criteria.CriteriaBuilder.In;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    @Autowired
    private final InvestmentRepository investmentRepository;

    @Autowired
    private TagRepository tagRepository;


    @Autowired
    private UserTagsRepository userTagsRepository;

    @Autowired
    public UserService(UserRepository userRepository, InvestmentRepository investmentRepository, UserTagsRepository userTagsRepository) {   
        this.userRepository = userRepository;
        this.investmentRepository = investmentRepository;
        this.userTagsRepository = userTagsRepository;
    }


    public users saveUsers(users user) {
        return userRepository.save(user);
    }

    public List<UserTags> getUserTags(long userId) {
        return userTagsRepository.findByUserId(userId);
    }
    public Tags getTagById(long tagId) {
        return tagRepository.findByTagId(tagId);
    }

    public List<users> getAllUsers() {
        return userRepository.findAll();
    }
    
        public Optional<users> getUserById(Long userId) {
        return userRepository.findById(userId);
    }
    public users getUserbyUsername(String Username) {
            return userRepository.findByUsername(Username);
    }
    public users getUserbyEmail(String email) {
        return userRepository.findByEmail(email);
    }
    public Long getIdByUsername(String Username) {
        logger.debug("In Service: {}",userRepository.findIdByUsername(Username));
        return Long.parseLong(userRepository.findIdByUsername(Username));
    }

    // Kaiden: step 2 : finding money by username function through user repository
    public int getMoneyByUsername(String Username) {
        return userRepository.findMoneyByUsername(Username);
    }

    public String getPass(int userId) {
        return userRepository.findPass(userId);
    }

    public void saveProfileImage(MultipartFile file,long id) throws IOException {
        users user = userRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        byte[] imageData = file.getBytes();
        user.setProfile_image(imageData);
        userRepository.save(user);
        System.out.println("fifififfififi");
    }

    public void saveBio(String bio,long id) throws IOException {
        users user = userRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        user.setBio(bio);
        userRepository.save(user);
        System.out.println("fifififfififi");
    }


    public void saveLinkedin(String Linkedin,long id) throws IOException {
        users user = userRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        user.setLinkedin(Linkedin);
        userRepository.save(user);
        System.out.println("fifififfififi");
    }
    @Transactional
    public void updateUsername(int  userId,String username) {
        userRepository.updateUsername(userId, username);
    }
    @Transactional
    public void updateEmail(int  userId,String email) {
       
        userRepository.updateEmail(userId, email);
    }
    @Transactional
    public void updatePassword(int  userId,String password) {
        
        userRepository.updatePassword(userId, password);
    }
    // Kaiden: step 2 : updating money by username function through user repository
    @Transactional
    public void updateUserMoney(String username,double money) {
        logger.debug("Updating money for user: {}", username," money: ",money);
        userRepository.updateUserMoney(username, money);
    }
    public users findByEmailAndVerificationCode(String email, String verificationCode) {
        return userRepository.findByEmailAVerificationCode(email, verificationCode);
    }
    public users findByUsernamendVerificationCode(String email, String verificationCode) {
        return userRepository.findByUsernamendVerificationCode(email, verificationCode);
    }

    public double getCash(Long id){
        return userRepository.findById(id).get().getMoney();
    }

    public double getInvesting(Long id){
        List<Investment> investments = investmentRepository.findInvestmentsByUserId(id);
        double investing = 0;
        for (Investment investment : investments) {
            double ratio = investment.getInvestmentAmount() / investment.getMarketPortValue();
            double value = ratio * investment.getPortfolio().getLastValue();
            investing += value;
            
        }
        
        return investing;
        
    }

    public List<String> getClubs(){
        return tagRepository.getClubs();
    }

    public double getClubScore(String club){
        List<users> userS = userRepository.getClubUsers(club);
        if(userS.size() < 10){
            return 0;
        } else{
            userS.sort(Comparator.comparingDouble(users::getAvgMaxReturn).reversed());
            double score = 0;
            for (int i = 0; i < 10; i++) {
                score += userS.get(i).getAvgMaxReturn();
            }
            score = score/10;
            return score;
        }

    }

    public List<users> getAllClubUsers(){
        return userRepository.getAllClubUsers();
    }

    public void deleteById(long id) {
        userRepository.deleteById(id);
    }
    //shitty comment
    // public users updateUserMoney(Long username, double newBalance) {
    //     users user = userRepository.findById(username).orElseThrow(() -> new RuntimeException("User not found"));
    //     user.setMoney(newBalance);
    //     return userRepository.save(user);
    // }
    
}
