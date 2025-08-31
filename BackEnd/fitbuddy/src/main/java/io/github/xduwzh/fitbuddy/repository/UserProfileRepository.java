package io.github.xduwzh.fitbuddy.repository;

import io.github.xduwzh.fitbuddy.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
}
