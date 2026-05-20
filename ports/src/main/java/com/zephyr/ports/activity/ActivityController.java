package com.zephyr.ports.activity;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.zephyr.ports.portfolios.Portfolio;
import com.zephyr.ports.portfolios.PortfolioController;
import com.zephyr.ports.portfolios.PortfolioService;
import com.zephyr.ports.users.UserService;
import com.zephyr.ports.users.users;
import com.zephyr.ports.Auth.EncryptionUtil;

import org.h2.engine.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("ports/activity")
public class ActivityController {
    // 0: like, 1: friend, 2: comment

    @Autowired
    EncryptionUtil encryptionUtil;

    @Autowired
    ActivityService activityService;

    @Autowired
    PortfolioService portfolioService;

    @Autowired
    UserService userService;

    private static final Logger logger = LoggerFactory.getLogger(ActivityController.class);

    @PostMapping("/like")
    public void like(@RequestParam Long userId, @RequestParam Long portId) {
        Optional<Activity> activity = activityService.getLike(portId, userId);
        if (activity.isPresent()) {
            activityService.delete(activity.get());
        } else {
            Activity newActivity = new Activity();
            newActivity.setUserId(userId);
            ZonedDateTime now = ZonedDateTime.now(ZoneId.of("America/New_York"));
            newActivity.setTimestamp(now);
            newActivity.setPortfolioId(portId);
            newActivity.setComment("");
            newActivity.setType(0);
            activityService.save(newActivity);
        }
    }
    @PostMapping("/favorite")
    public void favorite(@RequestParam Long userId, @RequestParam Long portId) {
        Optional<Activity> activity = activityService.getFavorite(portId, userId);
        if (activity.isPresent()) {
            activityService.delete(activity.get());
        } else {
            Activity newActivity = new Activity();
            newActivity.setUserId(userId);
            ZonedDateTime now = ZonedDateTime.now(ZoneId.of("America/New_York"));
            newActivity.setTimestamp(now);
            newActivity.setPortfolioId(portId);
            newActivity.setComment("");
            newActivity.setType(1);
            activityService.save(newActivity);
        }
    }
    @PostMapping("/comment")
    public void comment(@RequestParam Long userId, @RequestParam Long portId, @RequestParam String comment) {
        logger.debug("comment: " + comment);
        Activity newActivity = new Activity();
        newActivity.setUserId(userId);
        users user = userService.getUserById(userId).get();
        newActivity.setUsername(user.getUsername());
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("America/New_York"));
        newActivity.setTimestamp(now);
        newActivity.setPortfolioId(portId);
        newActivity.setType(2);
        newActivity.setComment(comment);
        activityService.save(newActivity);
    }




    

    public int getLikeCount(Long portId) {
        List<Activity> activities = activityService.getLikes(portId);
        return activities.size();
    }
    public int getFavoriteCount(Long portId) {
        List<Activity> activities = activityService.getFavorites(portId);
        return activities.size();
    }
    @GetMapping("/getFavoritesPorts")
    public String getFavoritesPorts(@RequestParam Long userId) throws Exception {
        Map<String,List<Portfolio>> favoritePorts = new HashMap<>();
        favoritePorts.put("content", activityService.findFavoritesPorts(userId));
        String response = EncryptionUtil.encryptFields(favoritePorts);
        return response;
    }
    @GetMapping("/getPortComments")
    public String getPortComments(@RequestParam Long portId) throws Exception {
        Map<String,List<Activity>> comments = new HashMap<>();
        comments.put("content", activityService.findPortComments(portId));
        String response = EncryptionUtil.encryptFields(comments);
        return response;
    }


    


}
