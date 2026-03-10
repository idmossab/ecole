package com.example._blog.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.IssuedCredential;
import com.example._blog.Entity.enums.IssueType;

@Repository
public interface IssuedCredentialRepo extends JpaRepository<IssuedCredential, Long> {
    boolean existsByUserIdAndTypeAndCertificateId(Long userId, IssueType type, Long certificateId);
    boolean existsByUserIdAndTypeAndDiplomaId(Long userId, IssueType type, Long diplomaId);
    Optional<IssuedCredential> findBySerialNumber(String serialNumber);
    List<IssuedCredential> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<IssuedCredential> findTop1ByUserIdOrderByCreatedAtDesc(Long userId);
    void deleteByUserId(Long userId);
    void deleteByCertificateId(Long certificateId);
    void deleteByDiplomaId(Long diplomaId);
    long countByType(IssueType type);
    long countByUserIdAndType(Long userId, IssueType type);
}
