package com.example._blog.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.Specialization;

@Repository
public interface SpecializationRepo extends JpaRepository<Specialization, Long> {
    List<Specialization> findByDiplomaIdOrderByCreatedAtDesc(Long diplomaId);
    boolean existsByDiplomaIdAndTitleIgnoreCase(Long diplomaId, String title);
    boolean existsByDiplomaIdAndTitleIgnoreCaseAndIdNot(Long diplomaId, String title, Long id);
    void deleteByDiplomaId(Long diplomaId);
}
