package com.example._blog.Entity;

import java.time.Instant;
import java.time.LocalDate;

import com.example._blog.Entity.enums.IssueType;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "issued_credentials")
@Getter @Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IssuedCredential {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssueType type;

    @ManyToOne
    @JoinColumn(name = "certificate_id")
    @JsonIgnore
    private Certificate certificate;

    @Column(name = "certificate_id", insertable = false, updatable = false)
    private Long certificateId;

    @ManyToOne
    @JoinColumn(name = "diploma_id")
    @JsonIgnore
    private Diplome diploma;

    @Column(name = "diploma_id", insertable = false, updatable = false)
    private Long diplomaId;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "serial_number", nullable = false, unique = true)
    private String serialNumber;

    @Column(name = "qr_payload", columnDefinition = "TEXT")
    private String qrPayload;

    @Column(name = "document_url")
    private String documentUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }
}
