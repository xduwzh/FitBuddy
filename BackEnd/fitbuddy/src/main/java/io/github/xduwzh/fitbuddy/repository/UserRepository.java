package io.github.xduwzh.fitbuddy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import io.github.xduwzh.fitbuddy.entity.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
}
