package io.github.xduwzh.fitbuddy.controller;

import io.github.xduwzh.fitbuddy.entity.UserProfile;
import io.github.xduwzh.fitbuddy.service.UserProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/users/{userId}/profile")
public class UserProfileController {

    private final UserProfileService profileService;

    public UserProfileController(UserProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public UserProfile getProfile(@PathVariable Long userId) {
        UserProfile p = profileService.getProfile(userId);
        if (p == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
        return p;
    }

    @PutMapping
    public UserProfile upsertProfile(@PathVariable Long userId, @RequestBody UserProfile body) {
        return profileService.upsertProfile(userId, body);
    }
}
