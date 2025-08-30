package io.github.xduwzh.fitbuddy.service;

import io.github.xduwzh.fitbuddy.entity.Checkin;
import io.github.xduwzh.fitbuddy.entity.User;
import io.github.xduwzh.fitbuddy.entity.UserCheckinStats;
import io.github.xduwzh.fitbuddy.repository.CheckinRepository;
import io.github.xduwzh.fitbuddy.repository.UserCheckinStatsRepository;
import io.github.xduwzh.fitbuddy.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CheckinService {

    private final CheckinRepository checkinRepository;
    private final UserRepository userRepository;
    private final UserCheckinStatsRepository statsRepository;

    public CheckinService(CheckinRepository checkinRepository, UserRepository userRepository, UserCheckinStatsRepository statsRepository) {
        this.checkinRepository = checkinRepository;
        this.userRepository = userRepository;
        this.statsRepository = statsRepository;
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User not found"));
    }

    @Transactional
    public Checkin checkinToday(Long userId) {
        User user = getUserOrThrow(userId);
        LocalDate today = LocalDate.now();
        if (checkinRepository.existsByUserAndCheckinDate(user, today)) {
            return checkinRepository.findByUserAndCheckinDate(user, today).get();
        }
        Checkin c = Checkin.builder().user(user).checkinDate(today).build();
        c = checkinRepository.save(c);

        // update stats
        UserCheckinStats stats = statsRepository.findById(user.getId()).orElseGet(() -> UserCheckinStats.builder()
                .user(user)
                .currentStreak(0)
                .longestStreak(0)
                .build());

        LocalDate last = stats.getLastCheckinDate();
        int current = stats.getCurrentStreak();
        if (last != null && last.equals(today.minusDays(1))) {
            current += 1;
        } else if (last != null && last.equals(today)) {
            // shouldn't happen since we checked exists, but keep safe
        } else {
            current = 1;
        }
        stats.setCurrentStreak(current);
        stats.setLongestStreak(Math.max(stats.getLongestStreak(), current));
        stats.setLastCheckinDate(today);
        statsRepository.save(stats);
        return c;
    }

    public boolean hasCheckedInToday(Long userId) {
        User user = getUserOrThrow(userId);
        return checkinRepository.existsByUserAndCheckinDate(user, LocalDate.now());
    }

    public List<Checkin> calendar(Long userId, LocalDate start, LocalDate end) {
        User user = getUserOrThrow(userId);
        return checkinRepository.findByUserAndCheckinDateBetween(user, start, end);
    }

    public UserCheckinStats stats(Long userId) {
        return statsRepository.findById(userId).orElse(null);
    }
}
