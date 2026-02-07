package com.example._blog.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.DiplomaRequirement;

@Repository
public interface DiplomaRequirementRepo extends JpaRepository<DiplomaRequirement, Long> {
    List<DiplomaRequirement> findByDiplomaId(Long diplomaId);

    void deleteByDiplomaId(Long diplomaId);

    @Query("select dr.certificate.id from DiplomaRequirement dr where dr.diploma.id = :diplomaId")
    List<Long> findCertificateIdsByDiplomaId(@Param("diplomaId") Long diplomaId);
}

