package com.zephyr.ports.users;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;

@Repository
public interface UserRepository extends JpaRepository<users,Long> {

    users findByUsername(String username);

    users findByEmail(String email);


    @Query("select id from users u where u.username = ?1")
    String findIdByUsername(String username);

    @Query("select password from users u where u.id = ?1")
    String findPass(int userId);

    // Kaiden: step 1: sql code to request money from user table by username

    @Query("select money from users u where u.username = ?1")
    int findMoneyByUsername(String username);



    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE users u SET u.username = :username WHERE u.id = :id")
    int updateUsername(@Param("id") int  userId, @Param("username") String username);


    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE users u SET u.email = :email WHERE u.id = :id")
    int updateEmail(@Param("id") int  userId, @Param("email") String  email);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE users u SET u.password = :password WHERE u.id = :id")
    int updatePassword(@Param("id") int  userId, @Param("password") String password);
    // Kaiden: step 1: sql code to update money in user table by username

    //shitty comment
    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE users u SET u.money = :money WHERE u.username = :username")
    int updateUserMoney(@Param("username") String  username, @Param("money") double  money);

    @Query("SELECT u FROM users u WHERE u.email = :email AND u.verificationCode = :verificationCode")
    users findByEmailAVerificationCode(@Param("email") String email, @Param("verificationCode") String verificationCode);
    @Query("SELECT u FROM users u WHERE u.username = :email AND u.verificationCode = :verificationCode")
    users findByUsernamendVerificationCode(@Param("email") String email, @Param("verificationCode") String verificationCode);

    @Query("SELECT u FROM users u JOIN u.tags t WHERE t.name = ?1")
    List<users> getClubUsers(String club);

    @Query("SELECT DISTINCT u FROM users u JOIN u.tags t WHERE t.type = 'college'")
    List<users> getAllClubUsers();

    
}