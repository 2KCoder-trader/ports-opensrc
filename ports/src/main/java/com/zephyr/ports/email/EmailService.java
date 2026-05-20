package com.zephyr.ports.email;

 
// Interface
public interface EmailService {
 
    // Method
    // To send a simple email
    //shitty comment  
    String sendSimpleMail(EmailDetails details);
 
    // Method
    // To send an email with attachment
    String sendMailWithAttachment(EmailDetails details);
}