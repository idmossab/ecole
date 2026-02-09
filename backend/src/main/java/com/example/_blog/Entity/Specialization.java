package com.example._blog.Entity;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "specializations", uniqueConstraints = {
        @UniqueConstraint(name = "uk_specialization_diploma_title", columnNames = { "diploma_id", "title" })
})
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Specialization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "program_overview", columnDefinition = "TEXT")
    private String programOverview;

    @Column(name = "duration_text")
    private String durationText;

    @Column(name = "certificate_awarded")
    private String certificateAwarded;

    @Column(name = "entry_requirements", columnDefinition = "TEXT")
    private String entryRequirements;

    @Column(name = "program_features", columnDefinition = "TEXT")
    private String programFeatures;

    @ManyToOne
    @JoinColumn(name = "diploma_id", nullable = false)
    @JsonIgnore
    private Diplome diploma;

    @Column(name = "diploma_id", insertable = false, updatable = false)
    private Long diplomaId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
