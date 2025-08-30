package io.github.xduwzh.fitbuddy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_checkin_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCheckinStats {
    @Id
    private Long userId; // same as users.id

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "last_checkin_date")
    private LocalDate lastCheckinDate;

    @Column(name = "current_streak", nullable = false)
    private int currentStreak;

    @Column(name = "longest_streak", nullable = false)
    private int longestStreak;
}
