package com.example._blog.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.UserCertificate;

@Repository
public interface UserCertificateRepo extends JpaRepository<UserCertificate, Long> {
    boolean existsByUserUserIdAndCertificateId(Long userId, Long certificateId);

    Optional<UserCertificate> findByUserUserIdAndCertificateId(Long userId, Long certificateId);

    @Query("select uc.certificate.id from UserCertificate uc where uc.user.userId = :userId")
    List<Long> findClaimedCertificateIdsByUserId(@Param("userId") Long userId);
}

