package com.example._blog.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.Certificate;
import java.util.List;

@Repository
public interface CertificateRepo extends JpaRepository<Certificate, Long> {
    boolean existsByTitleIgnoreCase(String title);
    boolean existsByTitleIgnoreCaseAndIdNot(String title, Long id);
    List<Certificate> findAllByOrderByCreatedAtDesc();
}
