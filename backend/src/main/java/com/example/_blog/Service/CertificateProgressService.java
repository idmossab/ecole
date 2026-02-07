package com.example._blog.Service;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.CertificateClaimResponse;
import com.example._blog.Dto.CertificateProgressResponse;
import com.example._blog.Dto.MyCertificateProgressResponse;
import com.example._blog.Entity.Certificate;
import com.example._blog.Entity.Media;
import com.example._blog.Entity.User;
import com.example._blog.Entity.UserCertificate;
import com.example._blog.Entity.UserVideoProgress;
import com.example._blog.Entity.enums.UserRole;
import com.example._blog.Repositories.CertificateRepo;
import com.example._blog.Repositories.CourseRepo;
import com.example._blog.Repositories.MediaRepo;
import com.example._blog.Repositories.UserCertificateRepo;
import com.example._blog.Repositories.UserRepo;
import com.example._blog.Repositories.UserVideoProgressRepo;

@Service
public class CertificateProgressService {
    private final CertificateRepo certificateRepo;
    private final CourseRepo courseRepo;
    private final MediaRepo mediaRepo;
    private final UserRepo userRepo;
    private final UserVideoProgressRepo userVideoProgressRepo;
    private final UserCertificateRepo userCertificateRepo;
    private final NotificationService notificationService;

    public CertificateProgressService(
            CertificateRepo certificateRepo,
            CourseRepo courseRepo,
            MediaRepo mediaRepo,
            UserRepo userRepo,
            UserVideoProgressRepo userVideoProgressRepo,
            UserCertificateRepo userCertificateRepo,
            NotificationService notificationService
    ) {
        this.certificateRepo = certificateRepo;
        this.courseRepo = courseRepo;
        this.mediaRepo = mediaRepo;
        this.userRepo = userRepo;
        this.userVideoProgressRepo = userVideoProgressRepo;
        this.userCertificateRepo = userCertificateRepo;
        this.notificationService = notificationService;
    }

    public CertificateProgressResponse getProgress(Long userId, Long certificateId) {
        ensureCertificateExists(certificateId);
        return buildProgress(userId, certificateId);
    }

    public CertificateProgressResponse markVideoWatched(Long userId, Long videoId, boolean watched) {
        Media video = mediaRepo.findById(videoId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Video not found"));
        Long certificateId = mediaRepo.findCertificateIdByVideoId(videoId)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Video is not linked to a certificate"));
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        UserVideoProgress progress = userVideoProgressRepo
                .findByUserUserIdAndVideoId(userId, videoId)
                .orElseGet(() -> UserVideoProgress.builder().user(user).video(video).build());

        progress.setWatched(watched);
        progress.setWatchedAt(watched ? Instant.now() : null);
        userVideoProgressRepo.save(progress);

        return buildProgress(userId, certificateId);
    }

    public CertificateClaimResponse claimCertificate(Long userId, Long certificateId) {
        ensureCertificateExists(certificateId);
        CertificateProgressResponse progress = buildProgress(userId, certificateId);
        if (!progress.isCompleted()) {
            throw new ResponseStatusException(BAD_REQUEST, "Finish all videos first to get this certificate.");
        }

        UserCertificate existing = userCertificateRepo.findByUserUserIdAndCertificateId(userId, certificateId).orElse(null);
        if (existing != null) {
            return new CertificateClaimResponse(
                    certificateId,
                    "Certificate already claimed",
                    existing.getClaimedAt(),
                    existing.getSerialNumber()
            );
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        Certificate certificate = certificateRepo.findById(certificateId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Certificate not found"));

        UserCertificate created = UserCertificate.builder()
                .user(user)
                .certificate(certificate)
                .claimedAt(Instant.now())
                .serialNumber(generateSerial(certificateId, userId))
                .build();
        created = userCertificateRepo.save(created);
        notificationService.notifyRole(
                UserRole.ADMIN,
                "Certificate Claimed",
                user.getUserName() + " claimed certificate: " + certificate.getTitle(),
                "CERTIFICATE_CLAIMED"
        );

        return new CertificateClaimResponse(
                certificateId,
                "Certificate claimed successfully",
                created.getClaimedAt(),
                created.getSerialNumber()
        );
    }

    public List<MyCertificateProgressResponse> getMyCertificatesProgress(Long userId) {
        LinkedHashSet<Long> certificateIds = new LinkedHashSet<>();
        certificateIds.addAll(userVideoProgressRepo.findStartedCertificateIdsByUserId(userId));
        certificateIds.addAll(userCertificateRepo.findClaimedCertificateIdsByUserId(userId));

        if (certificateIds.isEmpty()) {
            return List.of();
        }

        List<MyCertificateProgressResponse> result = new ArrayList<>();
        for (Long certificateId : certificateIds) {
            Certificate certificate = certificateRepo.findById(certificateId).orElse(null);
            if (certificate == null) continue;

            CertificateProgressResponse progress = buildProgress(userId, certificateId);
            String status = progress.isClaimed()
                    ? "Claimed"
                    : (progress.isCompleted() ? "Completed" : "In progress");
            Long firstCourseId = courseRepo.findByCertificateId(certificateId).stream()
                    .findFirst()
                    .map(course -> course.getId())
                    .orElse(null);

            result.add(new MyCertificateProgressResponse(
                    certificateId,
                    certificate.getTitle(),
                    progress.totalVideos(),
                    progress.watchedVideos(),
                    progress.percentage(),
                    progress.remainingVideos(),
                    progress.isCompleted(),
                    progress.isClaimed(),
                    status,
                    firstCourseId
            ));
        }
        return result;
    }

    private CertificateProgressResponse buildProgress(Long userId, Long certificateId) {
        long totalVideos = mediaRepo.countByCertificateId(certificateId);
        long watchedVideos = userVideoProgressRepo.countWatchedVideos(userId, certificateId);
        boolean isCompleted = totalVideos > 0 && watchedVideos == totalVideos;
        long remainingVideos = Math.max(0, totalVideos - watchedVideos);
        int percentage = totalVideos > 0
                ? (int) Math.round((watchedVideos * 100.0) / totalVideos)
                : 0;
        boolean isClaimed = userCertificateRepo.existsByUserUserIdAndCertificateId(userId, certificateId);

        return new CertificateProgressResponse(
                certificateId,
                totalVideos,
                watchedVideos,
                percentage,
                remainingVideos,
                isCompleted,
                isClaimed
        );
    }

    private void ensureCertificateExists(Long certificateId) {
        if (!certificateRepo.existsById(certificateId)) {
            throw new ResponseStatusException(NOT_FOUND, "Certificate not found");
        }
    }

    private String generateSerial(Long certificateId, Long userId) {
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "CERT-" + certificateId + "-" + userId + "-" + randomPart;
    }
}
