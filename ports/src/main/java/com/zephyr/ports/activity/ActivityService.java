package com.zephyr.ports.activity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import com.zephyr.ports.portfolios.Portfolio;




@Service
public class ActivityService {

    @Autowired
    ActivityRepository activityRepository;

    public List<Activity> getActivities(Long userId, Long portId) {
        return activityRepository.findSocialInfo(userId, portId);
    }
    public Optional<Activity> getLike(Long portId, Long userId) {
        return activityRepository.findLike(portId, userId);
    }
    public Optional<Activity> getFavorite(Long portId, Long userId) {
        return activityRepository.findFavorite(portId, userId);
    }
    public void save(Activity activity) {
        activityRepository.save(activity);
    }
    public void delete(Activity activity) {
        activityRepository.delete(activity);
    }
    public List<Activity> getLikes(Long portId){
        return activityRepository.getSocialType(portId, 0);
    }
    public List<Activity> getFavorites(Long portId){
        return activityRepository.getSocialType(portId, 1);
    }
    public List<Portfolio> findFavoritesPorts(Long userId){
        return activityRepository.findFavoritesPorts(userId);
    }
    public List<Activity> findPortComments(Long portId){
        return activityRepository.findPortComments(portId);
    }

    public Map<String, Boolean> getSocialInfo(@RequestParam Long userId, @RequestParam Long portId) throws Exception {
        List<Activity> activities = getActivities(userId, portId);
        Map<String, Boolean> socialInfo = new HashMap<>();
        socialInfo.put("like", false);
        socialInfo.put("favorite", false);
        for (Activity activity : activities) {
            if (activity.getType() == 0) {
                socialInfo.put("like", true);
            } else {
                socialInfo.put("favorite", true);
            }
        }
        return socialInfo;
    }

}
