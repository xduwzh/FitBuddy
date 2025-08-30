package io.github.xduwzh.fitbuddy.repository;

import io.github.xduwzh.fitbuddy.entity.Checkin;
import io.github.xduwzh.fitbuddy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CheckinRepository extends JpaRepository<Checkin, Long> {
    boolean existsByUserAndCheckinDate(User user, LocalDate date);
    Optional<Checkin> findByUserAndCheckinDate(User user, LocalDate date);
    List<Checkin> findByUserAndCheckinDateBetween(User user, LocalDate start, LocalDate end);
}
