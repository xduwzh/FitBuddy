package io.github.xduwzh.fitbuddy.controller;

import io.github.xduwzh.fitbuddy.entity.Checkin;
import io.github.xduwzh.fitbuddy.entity.UserCheckinStats;
import io.github.xduwzh.fitbuddy.service.CheckinService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/checkin")
public class CheckinController {

    private final CheckinService checkinService;

    public CheckinController(CheckinService checkinService) {
        this.checkinService = checkinService;
    }

    // Checkin today（POST /checkin?userId=...）
    @PostMapping
    public Checkin checkinToday(@RequestParam Long userId) {
        return checkinService.checkinToday(userId);
    }

    // Check if checked in today（GET /checkin?userId=...）
    @GetMapping
    public boolean hasCheckedInToday(@RequestParam Long userId) {
        return checkinService.hasCheckedInToday(userId);
    }

    // Look up check-in calendar（GET /checkin/calendar?userId=...&start=YYYY-MM-DD&end=YYYY-MM-DD）
    @GetMapping("/calendar")
    public List<Checkin> calendar(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return checkinService.calendar(userId, start, end);
    }

    // Look up monthly check-in status（GET /checkin/month?userId=...&year=YYYY&month=M）
    @GetMapping("/month")
    public List<Checkin> month(
            @RequestParam Long userId,
            @RequestParam int year,
            @RequestParam int month) {
        LocalDate first = LocalDate.of(year, month, 1);
        LocalDate last = first.withDayOfMonth(first.lengthOfMonth());
        return checkinService.calendar(userId, first, last);
    }

    // Look up user check-in statistics（GET /checkin/stats?userId=...）
    @GetMapping("/stats")
    public UserCheckinStats stats(@RequestParam Long userId) {
        return checkinService.stats(userId);
    }
}
