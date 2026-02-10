package com.example._blog.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
    List<JoinRequest> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, JoinRequestStatus status);
    boolean existsByUserIdAndCertificateIdAndCourseIdAndStatusIn(
            Long userId,
            Long certificateId,
            Long courseId,
            List<JoinRequestStatus> statuses
    );

    @Query(
            value = """
                    select count(*)
                    from (
                      select distinct r.user_id, r.certificate_id
                      from join_requests r
                      join users u on u.id = r.user_id
                      where r.status = 'ACCEPTED' and u.status = 'ACTIVE'
                    ) x
                    """,
            nativeQuery = true
    )
    long countAcceptedActiveCertificateJoins();
}
