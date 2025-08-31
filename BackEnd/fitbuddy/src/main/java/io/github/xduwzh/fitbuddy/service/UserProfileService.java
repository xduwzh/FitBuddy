package io.github.xduwzh.fitbuddy.service;

import io.github.xduwzh.fitbuddy.entity.PrimaryGoal;
import io.github.xduwzh.fitbuddy.entity.User;
import io.github.xduwzh.fitbuddy.entity.UserProfile;
import io.github.xduwzh.fitbuddy.repository.UserProfileRepository;
import io.github.xduwzh.fitbuddy.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
public class UserProfileService {

    private final UserProfileRepository profileRepository;
    private final UserRepository userRepository;

    public UserProfileService(UserProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User not found"));
    }

    @Transactional(readOnly = true)
    public UserProfile getProfile(Long userId) {
        return profileRepository.findById(userId).orElse(null);
    }

    @Transactional
    public UserProfile upsertProfile(Long userId, UserProfile payload) {
        User user = getUserOrThrow(userId);
        UserProfile profile = profileRepository.findById(userId).orElseGet(() -> UserProfile.builder()
                .user(user)
                .build());

        // Map fields from payload
        profile.setUsername(payload.getUsername());
        profile.setAge(payload.getAge());
        profile.setGender(payload.getGender());
        profile.setTargetWeight(payload.getTargetWeight());
        profile.setPrimaryGoal(payload.getPrimaryGoal() != null ? payload.getPrimaryGoal() : PrimaryGoal.LOSE_WEIGHT);

        return profileRepository.save(profile);
    }
}
