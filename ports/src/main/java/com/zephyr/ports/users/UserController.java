package com.zephyr.ports.users;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.zephyr.ports.Auth.AuthenticationService;
import com.zephyr.ports.Auth.EncryptionUtil;
import com.zephyr.ports.Auth.JwtService;
import com.zephyr.ports.Auth.TokenRefreshService;
import com.zephyr.ports.SecurityConfiguration.HtmlSanitizer;
import com.zephyr.ports.dtos.LoginUserDto;
import com.zephyr.ports.email.EmailController;
import com.zephyr.ports.email.EmailDetails;
import com.zephyr.ports.portfolios.PortfolioService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@RestController
@RequestMapping("/ports/user")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final AuthenticationService authenticationService;
    private final UserService userService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private String googleClientId = "244477881106-iplsdl5s9335sn0bpjr4rq4e6uafnk40.apps.googleusercontent.com";
    @Autowired
    RecaptchaService recaptchaService;
    @Autowired
    private HtmlSanitizer htmlSanitizer;
    @Autowired
    EmailController emailController;

    @Autowired

    TagRepository tagRepository;
     
    @Autowired
    PortfolioService portfolioService;


    @Autowired
    TokenRefreshService tokenRefreshService;

    @Autowired
    EmailDetails emailDetails;
    @Autowired
    public UserController(UserService userService, AuthenticationService authenticationService, JwtService jwtService, UserRepository userRepository) {
        this.authenticationService = authenticationService;
        this.userService = userService;
        this.jwtService = new JwtService();
    }


    /**
     * @param user
     * @return Response 200
     * 
     *         This is how we create new users using register
     */
    @PostMapping("/saveUsers")
    public ResponseEntity<String> saveUserss(@RequestBody users user, @RequestParam List <Integer> tags) {
        user = htmlSanitizer.sanitize(user);
        for (long tagId : tags) {
            System.out.println(tagId);
            Optional<Tags> tag = tagRepository.findById(tagId);

            System.out.println(tag.get());
            user.getTags().add(tag.get());
        }
        String verificationCode = UUID.randomUUID().toString().substring(0, 6);
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
       
        user.setActive(false);
        user.setVerificationCode(verificationCode);
        users newUser = userService.saveUsers(user);

        emailDetails.setSubject("Verify your Ports account!");
        emailDetails.setMsgBody("Your Code is: " + verificationCode);
        emailDetails.setRecipient(user.getEmail());
        System.out.println(user.getEmail());
        emailController.sendMail(emailDetails);
        try {
            return ResponseEntity.ok(EncryptionUtil.encryptFields(newUser));
        } catch (Exception e) {
          return ResponseEntity.badRequest().body("null");
        }
       
        // return ResponseEntity.ok(newUser);
    }

    @PostMapping("/resendverification")
    public void resend(@RequestBody long id) {
    
        Optional<users> user = userService.getUserById(id);
        String verificationCode = UUID.randomUUID().toString().substring(0, 6);
        users u = user.get();
        u.setActive(false);
        u.setVerificationCode(verificationCode);
       

        emailDetails.setSubject("Verify your Ports account!");
        emailDetails.setMsgBody("Your Code is: " + verificationCode);
        emailDetails.setRecipient(u.getEmail());
        System.out.println(u.getEmail());
        emailController.sendMail(emailDetails);

        users newUser = userService.saveUsers(u);

    }


    
    public ResponseEntity<users> saveUsers(@RequestBody users user) {
        String verificationCode = UUID.randomUUID().toString().substring(0, 6);
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
       
        user.setActive(false);
        user.setVerificationCode(verificationCode);
        users newUser = userService.saveUsers(user);

        emailDetails.setSubject("Verify your Ports account!");
        emailDetails.setMsgBody("Your Code is: " + verificationCode);
        emailDetails.setRecipient(user.getEmail());
        
        emailController.sendMail(emailDetails);
    
       
        return ResponseEntity.ok(newUser);
    }

    @PostMapping("/verify") 
    public ResponseEntity<?> verifyEmail(@RequestParam String email,@RequestParam String verificationCode) {
        // email = htmlSanitizer.sanitize(email);
        // System.out.println(email);
        // verificationCode = htmlSanitizer.sanitize(verificationCode);
        users user = userService.findByEmailAndVerificationCode(email, verificationCode);
        if (user == null) {
            return ResponseEntity.badRequest().body("Invalid verification code.");
        }
        user.setActive(true);
        user.setMoney(1500);
        user.setVerificationCode(null);
        userService.saveUsers(user);
        return ResponseEntity.ok(user.getUsername());
    }
    /**
     * @return reponse 200
     * 
     *         get all of the users in the table
     */
    // @GetMapping("/getAllUsers")
    // public List<users> getAllUsers() {
    //     return userService.getAllUsers();
    // }

    /**
     * @param Username
     * @return Response 200
     * 
     *         this is how we get each one of the users using the username
     */

    public users getUserbyEmail(@RequestParam String email) {
        email = htmlSanitizer.sanitize(email);
        return userService.getUserbyEmail(email);
    }

    @GetMapping("/getOneUsers")
    public String getUserByUsername3(@RequestParam String Username) throws Exception {
        Username = htmlSanitizer.sanitize(Username);
        System.out.println("fkfkf");
        return EncryptionUtil.encryptFields(userService.getUserbyUsername(Username));
      
    }
@PostMapping("/image")
    public ResponseEntity<String> uploadimage(@RequestParam MultipartFile image,@RequestParam long id) throws IOException {

        image = htmlSanitizer.sanitizeFile(image);

        // try {
            logger.debug("ffkfkffkfkfkfkfkfkfk");
            userService.saveProfileImage(image,id);
            return ResponseEntity.ok("Image uploaded successfully");
    //     } catch (IOException e) 
    //    {
    //    e.printStackTrace();
    //     logger.debug("ffkfkffkfkfkfkfkfefeeeeeeeeeeeeeeeeeeeeeekfk");
    //         return ResponseEntity.internalServerError().body("Failed to upload image");
    //     }
    }
    @PostMapping("/bio")
    public ResponseEntity<String> bio(@RequestParam String bio,@RequestParam long id) throws IOException {

        bio = htmlSanitizer.sanitize(bio);
        // try {
            logger.debug("ffkfkffkfkfkfkfkfkfk");
            System.out.println(bio);
            userService.saveBio(bio,id);
            return ResponseEntity.ok("Image uploaded successfully");
    //     } catch (IOException e) 
    //    {
    //    e.printStackTrace();
    //     logger.debug("ffkfkffkfkfkfkfkfefeeeeeeeeeeeeeeeeeeeeeekfk");
    //         return ResponseEntity.internalServerError().body("Failed to upload image");
    //     }
    }


    @PostMapping("/Linkedin")
    public ResponseEntity<String> Linkedin(@RequestParam String Linkedin,@RequestParam long id) throws IOException {

        Linkedin = htmlSanitizer.sanitize(Linkedin);
        // try {
            logger.debug("ffkfkffkfkfkfkfkfkfk");
            userService.saveLinkedin(Linkedin,id);
            return ResponseEntity.ok("Image uploaded successfully");
    //     } catch (IOException e) 
    //    {
    //    e.printStackTrace();
    //     logger.debug("ffkfkffkfkfkfkfkfefeeeeeeeeeeeeeeeeeeeeeekfk");
    //         return ResponseEntity.internalServerError().body("Failed to upload image");
    //     }
    }
    public users getUserByUsername(@RequestParam String Username) throws Exception {
        Username = htmlSanitizer.sanitize(Username);
        return userService.getUserbyUsername(Username);


    }
    @GetMapping("/getUserById")
    public String getUserById2(@RequestParam long id) {
        try {
            return EncryptionUtil.encryptFields(userService.getUserById(id).get());
        } catch (Exception e) {
          
           return "";
        }
    }
    @GetMapping("/getUserById2")
    public users getUserById(@RequestParam long id) {
        return userService.getUserById(id).get();
    }

    @GetMapping("/getLeaderboards")
    public String getLeaderboards() throws Exception {
        List<users> users = userService.getAllClubUsers();
        Map<String,List<?>> responseMap = new HashMap<>();
        responseMap.put("userLeaderboard", getUserLeaderboard(users));
        logger.debug("user leaderboard response {}", responseMap.get("userLeaderboard"));
        responseMap.put("investmentLeaderboard", getInvestmentLeaderboard(users));
        logger.debug("invest leaderboard response {}", responseMap.get("investmentLeaderboard"));
        responseMap.put("clubLeaderboard", getClubLeaderboard());
        logger.debug("club leaderboard response {}", responseMap.get("clubLeaderboard"));
        return EncryptionUtil.encryptFields(responseMap);
        
    }




 
    public List<users> getUserLeaderboard(List<users> usersParam){
        List<users> users = new ArrayList<>(usersParam);
        users.sort(Comparator.comparingDouble(user -> (Double) user.getAvgMaxReturn()));
        Collections.reverse(users);
        int endIndex = Math.min(users.size(), 10);
        List<users> top10Users = users.subList(0, endIndex);
        
        // I removed the rank will be calculated on the front end
    

        return top10Users;
    }
    public List<users> getInvestmentLeaderboard(List<users> usersParam){
        List<users> users = new ArrayList<>(usersParam);
        users.sort(Comparator.comparingDouble(user -> (Double) user.getTotalBalance()));
        Collections.reverse(users);
        int endIndex = Math.min(users.size(), 10);
        List<users> top10Users = users.subList(0, endIndex);
        // I removed the rank will be calculated on the front end
        return top10Users;
    }
    public List<Map<String, Object>> getClubLeaderboard()  {
        List<Map<String, Object>> clubScores = new ArrayList<>();
        List<String> clubs = userService.getClubs();
        for (String club : clubs) {
            double clubScore = userService.getClubScore(club);
            Map<String, Object> clubScoreMap = new HashMap<>();
            clubScoreMap.put("club", club);
            clubScoreMap.put("score", clubScore);

            clubScores.add(clubScoreMap);
        }

        clubScores.sort(Comparator.comparingDouble(clubScore -> (Double) clubScore.get("score")));
        Collections.reverse(clubScores);
        int endIndex = Math.min(clubScores.size(), 10);
        List<Map<String, Object>> top10ClubScores = clubScores.subList(0, endIndex);
        // I removed the rank will be calculated on the front end
        return top10ClubScores;
    }
    

    @PostMapping("/verifyuser")
    public ResponseEntity<?> verifyUser(@RequestBody LoginUserDto loginUserDto,@RequestParam String recaptchaToken,HttpServletResponse response,HttpServletRequest request) {
        // logger.debug("response: ", response.toString());
        // logger.debug("request: ", jwtService.getDomain(request));
        logger.debug("hit verify user");

        loginUserDto = htmlSanitizer.sanitize(loginUserDto);
        recaptchaToken = htmlSanitizer.sanitize(recaptchaToken);
        // request = HtmlSanitizer.sanitizeRequest(request);
        // response = HtmlSanitizer.sanitizeResponse(response);
        users authenticatedUser = authenticationService.authenticate(loginUserDto);

        boolean isRecaptchaValid = recaptchaService.verifyRecaptcha(recaptchaToken);
        logger.debug("recaptcha valid: {}", isRecaptchaValid);
        if(recaptchaToken.equals("expo-bypass")) {
            isRecaptchaValid = true;
        }
        logger.debug("recaptcha valid: {}", isRecaptchaValid);
        if("localhost".equals(jwtService.getDomain(request))){
            isRecaptchaValid = true;
        }

        if(authenticatedUser.isActive() == false) {
            return ResponseEntity.status(401).body("{\"message\" : \"Invalid user\"");
        }
        if(!isRecaptchaValid) {
            return ResponseEntity.status(401).body("{\"message\" : \"Invalid Captcha\"");
        } 
        if ((authenticatedUser.getUsername() == null) || (loginUserDto.getPassword().equals("google"))) {

            return ResponseEntity.status(401).body("Invalid username or password");
        } else {
            if (passwordEncoder.matches(loginUserDto.getPassword(), authenticatedUser.getPassword())) {

                String jwtToken = jwtService.generateToken(authenticatedUser, request);
                String refreshToken = tokenRefreshService.createRefreshToken(authenticatedUser, request);

                // Create cookies with environment-aware settings
                ResponseCookie jwtCookie = jwtService.createSecureCookie("jwtToken", jwtToken, request);
                ResponseCookie refreshCookie = tokenRefreshService.createRefreshCookie(refreshToken, request);
                        // .httpOnly(true)
                        // .secure(true)
                        // .path("/")
                        // .maxAge(3600)
                        // .sameSite("None")
                        // .build();

                // Set security headers and cookies
                jwtService.setSecurityHeadersAndCookie(response, jwtToken);
                logger.debug("login successful {}", authenticatedUser.getId());
                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                        .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                        .body(new ObjectMapper().createObjectNode().put("id", authenticatedUser.getId()).toString());
            } else {
                return ResponseEntity.status(401).body("Invalid username or password");
            }
        }

        // }
    }
        @Scheduled(cron = "0 0 0 * * *")
        public void updateUserDaily() throws Exception {
            logger.debug("Starting daily update of portfolios");
            ExecutorService executor = Executors.newCachedThreadPool();
            List<users> userS = userService.getAllUsers();
            for (users user: userS) {
                executor.submit(() -> {
                    try {
                        dailyUserUpdate(user);
                    } catch (Exception e) {
                        logger.error("Error updating port {}", user.getId(), e);
                    }
                });
            }
            // activate any closed investments

            executor.shutdown();
            executor.awaitTermination(Long.MAX_VALUE, TimeUnit.NANOSECONDS);
            logger.debug("Finished updating portfolios");
        
    }
    public void dailyUserUpdate(users user) {
        user.setAvgMaxReturn(portfolioService.getAvgMaxReturn(user.getId()));
        user.setInvested(userService.getInvesting(user.getId()));
        user.setTotalBalance(user.getMoney() + user.getInvested());
        userService.saveUsers(user);
    }


    @GetMapping("/getUserTags")
    public String getUserTags(@RequestParam long id) throws Exception {
        List<UserTags> userTags = userService.getUserTags(id);
        List<Tags> tagsList = new ArrayList<>();
        for (UserTags userTag : userTags) {
            tagsList.add(userService.getTagById(userTag.getTagId()));
        }

        Map<String, List<Tags>> responseMap = new HashMap<>();
        responseMap.put("content", tagsList);
        return EncryptionUtil.encryptFields(responseMap);
    }



    @PostMapping("/loginuser")
    public ResponseEntity<?> loginuser(@RequestBody LoginUserDto loginUserDto,@RequestParam("recaptchaToken") String recaptchaToken) {
        users authenticatedUser = authenticationService.authenticate(loginUserDto);
        loginUserDto = htmlSanitizer.sanitize(loginUserDto);
        recaptchaToken = htmlSanitizer.sanitize(recaptchaToken);
        // boolean isRecaptchaValid = recaptchaService.verifyRecaptcha(recaptchaToken);
        boolean isRecaptchaValid = true;


        if(!isRecaptchaValid) {
            return ResponseEntity.status(401).body("{\"message\" : \"Invalid Captcha\"");
        } 
        if(!authenticatedUser.isActive()) {
            return ResponseEntity.status(401).body("{\"message\" : \"Email not verified\"");
        }  


        if ((authenticatedUser.getUsername() == null) || (loginUserDto.getPassword().equals("google"))) {
            return ResponseEntity.status(401).body("Invalid username or password");
        } else {



            if (passwordEncoder.matches(loginUserDto.getPassword(), authenticatedUser.getPassword())) {
                String verificationCode = UUID.randomUUID().toString().substring(0, 6);
                authenticatedUser.setVerificationCode(verificationCode);
                userService.saveUsers(authenticatedUser);
                emailDetails.setSubject("Verify your Ports account!");
                emailDetails.setMsgBody("Your Code is: " + verificationCode);
                emailDetails.setRecipient(authenticatedUser.getEmail());
                
                emailController.sendMail(emailDetails);

                return ResponseEntity.ok("{\"message\": \"Email verified\"}");


              
            } else {
                return ResponseEntity.status(401).body("Invalid username or password");
            }
        }
    }

    @PostMapping("/verifyLogo") 
    public ResponseEntity<?> verifyLogin(@RequestParam String username,@RequestParam String verificationCode) {
        username = htmlSanitizer.sanitize(username);
        verificationCode = htmlSanitizer.sanitize(verificationCode);
        

        users user = userService.findByUsernamendVerificationCode(username, verificationCode);
        if (user == null) {
            return ResponseEntity.badRequest().body("Invalid verification code.");
        }
        user.setVerificationCode(null);
        userService.saveUsers(user);
        String jwtToken = jwtService.generateToken(user);
        LoginResponse loginResponse = new LoginResponse().setToken(jwtToken)
                .setExpiresIn(jwtService.getExpirationTime());
        return ResponseEntity.ok(loginResponse);

    }

    @PostMapping("/SendEmail") 
    public ResponseEntity<?> sendMeail(@RequestParam String email,@RequestParam long userId) {
        email = htmlSanitizer.sanitize(email);
        System.out.println(email);
        users use =  userService.getUserById(userId).get();
        String verificationCode = UUID.randomUUID().toString().substring(0, 6);
        use.setVerificationCode(verificationCode);
        userService.saveUsers(use);
        emailDetails.setSubject("Verify your Ports account!");
        emailDetails.setMsgBody("Your Code is: " + verificationCode);
        emailDetails.setRecipient(email);
        
        emailController.sendMail(emailDetails);
        return ResponseEntity.ok("{\"message\": \"Email Sent\"}");

    }


    @PostMapping("/sendForgotEmail") 
    public ResponseEntity<?> sendMeail(@RequestParam String email,@RequestParam String Username) {
        email = htmlSanitizer.sanitize(email);
        Username = htmlSanitizer.sanitize(Username);
        users use =  userService.getUserbyEmail(email);
        String verificationCode = UUID.randomUUID().toString().substring(0, 6);
        use.setVerificationCode(verificationCode);
        userService.saveUsers(use);
        emailDetails.setSubject("Verify your Ports account!");
        emailDetails.setMsgBody("Your Code is: " + verificationCode);
        emailDetails.setRecipient(email);
        
        emailController.sendMail(emailDetails);
        return ResponseEntity.ok("{\"message\": \"Email Sent\"}");

    }



    @PostMapping("/verifyEmail") 
    public ResponseEntity<?> verifyEmailg(@RequestParam String username,@RequestParam String verificationCode) {
        username = htmlSanitizer.sanitize(username);
        verificationCode = htmlSanitizer.sanitize(verificationCode);
        users user = userService.findByUsernamendVerificationCode(username, verificationCode);
        if (user == null) {
            return ResponseEntity.badRequest().body("Invalid verification code.");
        }
       
            return ResponseEntity.ok().body("{\"message\": \"Good verification code.\"}");
       


    }
 
    @PostMapping("/verifyForgotPassword") 
    public ResponseEntity<?> verifyEmailge(@RequestParam String username,@RequestParam String verificationCode) {
        username = htmlSanitizer.sanitize(username);
        verificationCode = htmlSanitizer.sanitize(verificationCode);
        users user = userService.findByEmailAndVerificationCode(username, verificationCode);
        if (user == null) {
            return ResponseEntity.badRequest().body("Invalid verification code.");
        }
       
            return ResponseEntity.ok().body("{\"message\": \"Good verification code.\"}");
       


    }
    

    @PostMapping("/google-signin")
    public ResponseEntity<?> googleSignIn(@RequestParam String request, @RequestParam String recaptchaToken) {
        request = htmlSanitizer.sanitize(request);
        recaptchaToken = htmlSanitizer.sanitize(recaptchaToken);
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
            .setAudience(Collections.singletonList(googleClientId))
            .build();
            GoogleIdToken idToken = verifier.verify(request);
            if (idToken != null) {
                Payload payload = idToken.getPayload();
             //   String userId = payload.getSubject();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                // Check if user exists, if not, create a new user
                users user = userService.getUserbyEmail(email);
                if (user == null) {
                    user = new users();
                    user.setUsername(name);
                    user.setEmail(email);
                    user.setPassword("google");
                    user = saveUsers(user).getBody();
                }

                // Generate JWT token
                String jwtToken = jwtService.generateToken(user);

                LoginResponse loginResponse = new LoginResponse()
                        .setToken(jwtToken)
                        .setExpiresIn(jwtService.getExpirationTime());
                Map<String, Object> response = new HashMap<>();
                //TODO: need to test google login later 
                response.put("loginResponse", loginResponse);
                response.put("username", user.getUsername());


                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body("Invalid ID token");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during Google sign-in: " + e.getMessage());
        }
    }


    @PostMapping("/changeUsername")
    public ResponseEntity<String> changeUser(@RequestParam int userId, @RequestParam String Username) {
        Username = htmlSanitizer.sanitize(Username);
        users user = userService.getUserById((long)userId).get();
        user.setUsername(Username);
        String jwtToken = jwtService.generateToken(user);
        userService.saveUsers(user);
        return ResponseEntity.ok(jwtToken);

    }   
    
    
    @PostMapping("/changeEmail")
    public ResponseEntity<String> changeEmail(@RequestParam int userId, @RequestParam String email) {
        email = htmlSanitizer.sanitize(email);
        users user = userService.getUserById((long)userId).get();
        user.setEmail(email);
        userService.saveUsers(user);
        return ResponseEntity.ok("Username Updated");

    }
    @PostMapping("/changePassword")
    public ResponseEntity<String> changePass(@RequestParam int userId, @RequestParam String password,@RequestParam String oldpassword) {
        password = htmlSanitizer.sanitize(password);
        oldpassword = htmlSanitizer.sanitize(oldpassword);
        
        Optional<users> f = userService.getUserById((long)userId);
        LoginUserDto loginUserDto = new LoginUserDto(f.get().getUsername(),oldpassword);
        users authenticatedUser = authenticationService.authenticate(loginUserDto);
        if (authenticatedUser.getUsername() == null) {
            return ResponseEntity.status(401).body("Invalid username or password");
        } else {
            if (passwordEncoder.matches(loginUserDto.getPassword(), authenticatedUser.getPassword())) {
                f.get().setPassword(passwordEncoder.encode(password));
                // userService.updatePassword(userId,passwordEncoder.encode(password));
                userService.saveUsers(f.get());
                return ResponseEntity.ok("Password Updated");
            }
        }

    
      
        return ResponseEntity.status(401).body("Invalid password");

    }


    @PostMapping("/ForgotPass")
    public ResponseEntity<String> changePforgotass(@RequestParam String email, @RequestParam String password,@RequestParam String verificationCode) {
        email = htmlSanitizer.sanitize(email);
        password = htmlSanitizer.sanitize(password);
        verificationCode = htmlSanitizer.sanitize(verificationCode);
        users use =  userService.findByEmailAndVerificationCode(email,verificationCode);
        use.setPassword((passwordEncoder.encode(password)));
        userService.saveUsers(use);
        return ResponseEntity.ok("Password Changed");
    }




    @GetMapping("/getCash")
    public String getCash(@RequestParam Long id) {
        try {
            return  EncryptionUtil.encrypt(Double.toString(userService.getCash(id)));
        } catch (Exception e) {
            return "";
        }
      
    }


    @GetMapping("/getInvesting")
    public String getInvesting(@RequestParam Long id) {
        try {
            return EncryptionUtil.encrypt(Double.toString(userService.getInvesting(id)));
        } catch (Exception e) {
           return "";
        }
    }

    @GetMapping("/getTotalBalance")
    public String getTotalBalance(@RequestParam Long id) {
        double f = userService.getCash(id) + userService.getInvesting(id);

        try {
            return EncryptionUtil.encrypt(Double.toString(Math.round(f * 100.0) / 100.0));
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            return "";
        }
    }




    @PostMapping("/update/balance")
    public void updateUserBalance(@RequestBody users user) {
        user = htmlSanitizer.sanitize(user);
        userService.updateUserMoney(
                user.getUsername(),
                user.getMoney());
    }

    @PostMapping("/deleteuser")
    public void deleteuser(String id) {
        System.out.println("deleteeeeeeeeeeeeeeeeee");
        long idd = userService.getIdByUsername(id);
        userService.deleteById(idd);

    }
}