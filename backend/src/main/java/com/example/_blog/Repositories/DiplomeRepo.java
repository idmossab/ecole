package com.example._blog.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.Diplome;

@Repository
public interface DiplomeRepo extends JpaRepository<Diplome, Long> {
    boolean existsByLabelIgnoreCase(String label);
    boolean existsByLabelIgnoreCaseAndIdNot(String label, Long id);
    List<Diplome> findAllByOrderByIdDesc();
}
