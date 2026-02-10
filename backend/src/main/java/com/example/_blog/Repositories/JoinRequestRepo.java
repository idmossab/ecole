package com.example._blog.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.JoinRequest;
import com.example._blog.Entity.enums.JoinRequestStatus;

@Repository
public interface JoinRequestRepo extends JpaRepository<JoinRequest, Long> {
    List<JoinRequest> findAllByOrderByCreatedAtDesc();
    boolean existsByUserIdAndCertificateIdAndStatus(Long userId, Long certificateId, JoinRequestStatus status);
    void deleteByCertificateId(Long certificateId);
    void deleteByCourseId(Long courseId);
    void deleteByUserId(Long userId);
}
