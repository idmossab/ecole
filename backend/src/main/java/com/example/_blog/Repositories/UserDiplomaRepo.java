package com.example._blog.Repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.UserDiploma;

@Repository
public interface UserDiplomaRepo extends JpaRepository<UserDiploma, Long> {
    boolean existsByUserUserIdAndDiplomaId(Long userId, Long diplomaId);
    Optional<UserDiploma> findByUserUserIdAndDiplomaId(Long userId, Long diplomaId);
}

