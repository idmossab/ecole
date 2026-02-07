package com.example._blog.Entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "user_diplomas",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_diploma", columnNames = {"user_id", "diplome_id"})
        }
)
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDiploma {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "diplome_id", nullable = false)
    private Diplome diploma;

    @Column(name = "claimed_at", nullable = false)
    @Builder.Default
    private Instant claimedAt = Instant.now();

    @Column(name = "serial_number", unique = true)
    private String serialNumber;
}

