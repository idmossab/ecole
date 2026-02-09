package com.example._blog.Entity;

import java.time.Instant;

import com.example._blog.Entity.enums.CourseMode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "courses",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_course_certificate_title", columnNames = {"certificate_id", "title"})
        }
)
@Getter @Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseMode mode = CourseMode.ONLINE;

    @Column(name = "teacher_name")
    private String teacherName;

    @Column(name = "teacher_bio", columnDefinition = "TEXT")
    private String teacherBio;

    @Column(name = "duration_text")
    private String durationText;

    @Column(name = "phone_contact")
    private String phoneContact;

    @Builder.Default
    @Column(name = "is_published", nullable = false)
    private boolean isPublished = true;

    @ManyToOne
    @JoinColumn(name = "certificate_id", nullable = false)
    @JsonIgnore
    private Certificate certificate;

    @Column(name = "certificate_id", insertable = false, updatable = false)
    private Long certificateId;

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
