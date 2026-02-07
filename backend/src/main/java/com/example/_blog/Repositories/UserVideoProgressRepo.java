package com.example._blog.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.UserVideoProgress;

@Repository
public interface UserVideoProgressRepo extends JpaRepository<UserVideoProgress, Long> {
    Optional<UserVideoProgress> findByUserUserIdAndVideoId(Long userId, Long videoId);

    @Query("""
            select count(uvp)
            from UserVideoProgress uvp
            where uvp.user.userId = :userId
              and uvp.watched = true
              and uvp.video.course.certificate.id = :certificateId
            """)
    long countWatchedVideos(@Param("userId") Long userId, @Param("certificateId") Long certificateId);

    @Query("""
            select distinct uvp.video.course.certificate.id
            from UserVideoProgress uvp
            where uvp.user.userId = :userId
              and uvp.watched = true
            """)
    List<Long> findStartedCertificateIdsByUserId(@Param("userId") Long userId);
}

