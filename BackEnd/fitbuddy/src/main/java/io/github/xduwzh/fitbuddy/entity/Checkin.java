package io.github.xduwzh.fitbuddy.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkins", uniqueConstraints = {
        @UniqueConstraint(name = "uk_checkins_user_date", columnNames = {"user_id", "checkin_date"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Checkin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "checkin_date", nullable = false)
    private LocalDate checkinDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
