package com.example._blog.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.DiplomaJoinRequest;
import com.example._blog.Entity.enums.JoinRequestStatus;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiplomaJoinRequestRepo extends JpaRepository<DiplomaJoinRequest, Long> {
    @Query(
            value = """
                    select count(*)
                    from (
                      select distinct r.user_id, r.diploma_id
                      from diploma_join_requests r
                      join users u on u.id = r.user_id
                      where r.status = 'ACCEPTED' and u.status = 'ACTIVE'
                    ) x
                    """,
            nativeQuery = true
    )
    long countAcceptedActiveDiplomaJoins();

    void deleteByUserId(Long userId);
    void deleteByDiplomaId(Long diplomaId);
    boolean existsByUserIdAndDiplomaIdAndStatus(Long userId, Long diplomaId, JoinRequestStatus status);
    boolean existsByUserIdAndDiplomaIdAndSpecializationIdAndStatus(
            Long userId,
            Long diplomaId,
            Long specializationId,
            JoinRequestStatus status
    );
    List<DiplomaJoinRequest> findAllByOrderByCreatedAtDesc();
    Optional<DiplomaJoinRequest> findTopByUserIdAndDiplomaIdOrderByCreatedAtDesc(Long userId, Long diplomaId);
    List<DiplomaJoinRequest> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, JoinRequestStatus status);
    boolean existsByUserIdAndDiplomaIdAndSpecializationIdAndStatusIn(
            Long userId,
            Long diplomaId,
            Long specializationId,
            List<JoinRequestStatus> statuses
    );
}
