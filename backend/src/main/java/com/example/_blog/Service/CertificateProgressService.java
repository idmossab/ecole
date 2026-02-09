package com.example._blog.Service;

import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.CertificateClaimResponse;
import com.example._blog.Dto.CertificateProgressResponse;
import com.example._blog.Dto.MyCertificateProgressResponse;
import com.example._blog.Entity.Certificate;
import com.example._blog.Entity.User;
import com.example._blog.Repositories.CertificateRepo;
import com.example._blog.Repositories.CourseRepo;
import com.example._blog.Repositories.UserRepo;

@Service
public class CertificateProgressService {
    private final CertificateRepo certificateRepo;
    private final CourseRepo courseRepo;
    private final UserRepo userRepo;

    public CertificateProgressService(
            CertificateRepo certificateRepo,
            CourseRepo courseRepo,
            UserRepo userRepo
    ) {
        this.certificateRepo = certificateRepo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
    }

    public CertificateProgressResponse getProgress(Long userId, Long certificateId) {
        ensureCertificateExists(certificateId);
        return new CertificateProgressResponse(certificateId, 0, 0, 0, 0, false, false);
    }

    public CertificateClaimResponse claimCertificate(Long userId, Long certificateId) {
        ensureCertificateExists(certificateId);
        User ignored = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        Instant claimedAt = Instant.now();
        String serialNumber = generateSerial(certificateId, userId);
        return new CertificateClaimResponse(certificateId, "Certificate claimed successfully", claimedAt, serialNumber);
    }

    public List<MyCertificateProgressResponse> getMyCertificatesProgress(Long userId) {
        return certificateRepo.findAllByOrderByCreatedAtDesc().stream()
                .map(certificate -> new MyCertificateProgressResponse(
                        certificate.getId(),
                        certificate.getTitle(),
                        0,
                        0,
                        0,
                        0,
                        false,
                        false,
                        "In progress",
                        courseRepo.findByCertificateIdOrderByCreatedAtDesc(certificate.getId()).stream()
                                .findFirst()
                                .map(course -> course.getId())
                                .orElse(null)
                ))
                .toList();
    }

    private Certificate ensureCertificateExists(Long certificateId) {
        return certificateRepo.findById(certificateId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Certificate not found"));
    }

    private String generateSerial(Long certificateId, Long userId) {
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "CERT-" + certificateId + "-" + userId + "-" + randomPart;
    }
}
