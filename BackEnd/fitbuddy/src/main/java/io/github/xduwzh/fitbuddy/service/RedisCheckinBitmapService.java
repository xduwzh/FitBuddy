package io.github.xduwzh.fitbuddy.service;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class RedisCheckinBitmapService {
    private final RedisTemplate<String, String> redisTemplate;

    public RedisCheckinBitmapService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private String key(Long userId, int year) {
        return "checkin:" + userId + ":" + year; // one bitmap per user per year
    }

    private int dayOfYear(LocalDate date) {
        return date.getDayOfYear() - 1; // 0-indexed bit offset
    }

    public boolean setChecked(Long userId, LocalDate date) {
        String k = key(userId, date.getYear());
        int offset = dayOfYear(date);
    // Using low-level connection bit ops (deprecated in interface but widely supported). Safe for our use.
    @SuppressWarnings("deprecation")
    Boolean old = redisTemplate.execute((RedisCallback<Boolean>) conn -> conn.setBit(k.getBytes(), offset, true));
        return old != null ? old : false;
    }

    public boolean isChecked(Long userId, LocalDate date) {
        String k = key(userId, date.getYear());
        int offset = dayOfYear(date);
    @SuppressWarnings("deprecation")
    Boolean val = redisTemplate.execute((RedisCallback<Boolean>) conn -> conn.getBit(k.getBytes(), offset));
        return Boolean.TRUE.equals(val);
    }

    public long countInRange(Long userId, LocalDate start, LocalDate end) {
        // If range is within one year, use BITCOUNT + mask via GETRANGE approach; otherwise, sum per day.
        if (start.getYear() == end.getYear()) {
            // Redis doesn't support bitcount by bit range directly in older APIs; fallback to per-day scan for simplicity
        }
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        long count = 0;
        LocalDate cur = start;
        for (int i = 0; i < days; i++) {
            if (isChecked(userId, cur)) count++;
            cur = cur.plusDays(1);
        }
        return count;
    }
}
