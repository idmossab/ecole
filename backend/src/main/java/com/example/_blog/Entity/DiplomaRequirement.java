package com.example._blog.Entity;

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
        name = "diploma_certificates",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_diploma_certificate", columnNames = {"diplome_id", "certificate_id"})
        }
)
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DiplomaRequirement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "diplome_id", nullable = false)
    private Diplome diploma;

    @ManyToOne(optional = false)
    @JoinColumn(name = "certificate_id", nullable = false)
    private Certificate certificate;
}

