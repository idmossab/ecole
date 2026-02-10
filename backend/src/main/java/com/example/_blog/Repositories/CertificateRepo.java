package com.example._blog.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example._blog.Entity.Certificate;
import java.util.List;

@Repository
public interface CertificateRepo extends JpaRepository<Certificate, Long> {
    boolean existsByTitleIgnoreCase(String title);
    boolean existsByTitleIgnoreCaseAndIdNot(String title, Long id);
    List<Certificate> findAllByOrderByCreatedAtDesc();

    @Modifying
    @Transactional
    @Query(value = "delete from users_certificates where certificate_id = ?1", nativeQuery = true)
    void deleteUserCertificateLinks(Long certificateId);
}
