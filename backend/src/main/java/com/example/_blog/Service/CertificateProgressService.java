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
import com.example._blog.Entity.UserCertificate;
import com.example._blog.Repositories.CertificateRepo;
import com.example._blog.Repositories.CourseRepo;
import com.example._blog.Repositories.UserCertificateRepo;
import com.example._blog.Repositories.UserRepo;

@Service
public class CertificateProgressService {
    private final CertificateRepo certificateRepo;
    private final CourseRepo courseRepo;
    private final UserRepo userRepo;
    private final UserCertificateRepo userCertificateRepo;

    public CertificateProgressService(
            CertificateRepo certificateRepo,
            CourseRepo courseRepo,
            UserRepo userRepo,
            UserCertificateRepo userCertificateRepo
    ) {
        this.certificateRepo = certificateRepo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
        this.userCertificateRepo = userCertificateRepo;
    }

    public CertificateProgressResponse getProgress(Long userId, Long certificateId) {
        ensureCertificateExists(certificateId);
        boolean isClaimed = userCertificateRepo.existsByUserUserIdAndCertificateId(userId, certificateId);
        return new CertificateProgressResponse(certificateId, 0, 0, 0, 0, false, isClaimed);
    }

    public CertificateClaimResponse claimCertificate(Long userId, Long certificateId) {
        Certificate certificate = ensureCertificateExists(certificateId);

        UserCertificate existing = userCertificateRepo.findByUserUserIdAndCertificateId(userId, certificateId).orElse(null);
        if (existing != null) {
            return new CertificateClaimResponse(certificateId, "Certificate already claimed", existing.getClaimedAt(), existing.getSerialNumber());
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        UserCertificate created = userCertificateRepo.save(UserCertificate.builder()
                .user(user)
                .certificate(certificate)
                .claimedAt(Instant.now())
                .serialNumber(generateSerial(certificateId, userId))
                .build());

        return new CertificateClaimResponse(certificateId, "Certificate claimed successfully", created.getClaimedAt(), created.getSerialNumber());
    }

    public List<MyCertificateProgressResponse> getMyCertificatesProgress(Long userId) {
        return userCertificateRepo.findClaimedCertificateIdsByUserId(userId).stream()
                .map(certificateId -> {
                    Certificate certificate = certificateRepo.findById(certificateId).orElse(null);
                    if (certificate == null) {
                        return null;
                    }
                    Long firstCourseId = courseRepo.findByCertificateIdOrderByCreatedAtDesc(certificateId).stream()
                            .findFirst()
                            .map(course -> course.getId())
                            .orElse(null);
                    return new MyCertificateProgressResponse(
                            certificateId,
                            certificate.getTitle(),
                            0,
                            0,
                            100,
                            0,
                            true,
                            true,
                            "Claimed",
                            firstCourseId
                    );
                })
                .filter(item -> item != null)
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
