package com.example._blog.Service;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.DiplomaCertificateStatusResponse;
import com.example._blog.Dto.DiplomaClaimResponse;
import com.example._blog.Dto.DiplomaProgressResponse;
import com.example._blog.Dto.DiplomaSummaryResponse;
import com.example._blog.Dto.admin.AdminDiplomaRequest;
import com.example._blog.Dto.admin.AdminDiplomaResponse;
import com.example._blog.Entity.Certificate;
import com.example._blog.Entity.Diplome;
import com.example._blog.Entity.User;
import com.example._blog.Entity.enums.DiplomasMode;
import com.example._blog.Entity.enums.UserRole;
import com.example._blog.Repositories.CertificateRepo;
import com.example._blog.Repositories.DiplomeRepo;
import com.example._blog.Repositories.UserRepo;

@Service
public class DiplomeService {
    private final DiplomeRepo diplomeRepo;
    private final CertificateRepo certificateRepo;
    private final UserRepo userRepo;
    private final NotificationService notificationService;

    public DiplomeService(
            DiplomeRepo diplomeRepo,
            CertificateRepo certificateRepo,
            UserRepo userRepo,
            NotificationService notificationService
    ) {
        this.diplomeRepo = diplomeRepo;
        this.certificateRepo = certificateRepo;
        this.userRepo = userRepo;
        this.notificationService = notificationService;
    }

    public Diplome createDiploma(String title, List<Long> certificateIds) {
        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Diploma title is required");
        }
        if (diplomeRepo.existsByLabelIgnoreCase(title.trim())) {
            throw new ResponseStatusException(CONFLICT, "Diploma title already exists");
        }
        if (certificateIds == null || certificateIds.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "At least one certificate is required");
        }

        Diplome diploma = diplomeRepo.save(Diplome.builder()
                .label(title.trim())
                .mode(DiplomasMode.TECHNICIAN)
                .build());
        List<Certificate> certificates = certificateRepo.findAllById(certificateIds);
        if (certificates.size() != certificateIds.size()) {
            throw new ResponseStatusException(BAD_REQUEST, "One or more certificates are invalid");
        }
        return diploma;
    }

    public List<DiplomaSummaryResponse> getAllDiplomas() {
        return diplomeRepo.findAllByOrderByIdDesc().stream()
                .map(diploma -> new DiplomaSummaryResponse(
                        diploma.getId(),
                        diploma.getLabel(),
                        certificateRepo.count(),
                        diploma.getMode()
                ))
                .toList();
    }

    public DiplomaSummaryResponse getDiplomaById(Long diplomaId) {
        Diplome diploma = diplomeRepo.findById(diplomaId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Diploma not found"));
        long requiredCount = certificateRepo.count();
        return new DiplomaSummaryResponse(diploma.getId(), diploma.getLabel(), requiredCount, diploma.getMode());
    }

    public List<AdminDiplomaResponse> getAllAdmin() {
        long requiredCount = certificateRepo.count();
        return diplomeRepo.findAllByOrderByIdDesc().stream()
                .map(diploma -> toAdminResponse(diploma, requiredCount))
                .toList();
    }

    public AdminDiplomaResponse createAdmin(AdminDiplomaRequest request) {
        String title = request.title().trim();
        if (diplomeRepo.existsByLabelIgnoreCase(title)) {
            throw new ResponseStatusException(CONFLICT, "Diploma title already exists");
        }
        Diplome diploma = Diplome.builder()
                .label(title)
                .mode(request.mode())
                .build();
        long requiredCount = certificateRepo.count();
        return toAdminResponse(diplomeRepo.save(diploma), requiredCount);
    }

    public AdminDiplomaResponse updateAdmin(Long diplomaId, AdminDiplomaRequest request) {
        Diplome diploma = ensureDiplomaExists(diplomaId);
        String title = request.title().trim();
        if (diplomeRepo.existsByLabelIgnoreCaseAndIdNot(title, diplomaId)) {
            throw new ResponseStatusException(CONFLICT, "Diploma title already exists");
        }
        diploma.setLabel(title);
        diploma.setMode(request.mode());
        long requiredCount = certificateRepo.count();
        return toAdminResponse(diplomeRepo.save(diploma), requiredCount);
    }

    public void deleteAdmin(Long diplomaId) {
        Diplome diploma = ensureDiplomaExists(diplomaId);
        diplomeRepo.delete(diploma);
    }

    public List<DiplomaCertificateStatusResponse> getDiplomaCertificates(Long diplomaId) {
        ensureDiplomaExists(diplomaId);
        return certificateRepo.findAllByOrderByCreatedAtDesc().stream()
                .map(certificate -> new DiplomaCertificateStatusResponse(
                        certificate.getId(),
                        certificate.getTitle(),
                        false
                ))
                .toList();
    }

    public DiplomaProgressResponse getProgress(Long userId, Long diplomaId) {
        Diplome diploma = ensureDiplomaExists(diplomaId);
        List<Certificate> requirements = certificateRepo.findAllByOrderByCreatedAtDesc();

        long requiredCount = requirements.size();
        long completedCount = 0;
        long remaining = Math.max(0, requiredCount - completedCount);
        int percentage = requiredCount > 0
                ? (int) Math.round((completedCount * 100.0) / requiredCount)
                : 0;
        boolean isCompleted = requiredCount > 0 && completedCount == requiredCount;
        boolean isClaimed = false;

        List<DiplomaCertificateStatusResponse> certStatus = requirements.stream()
                .map(cert -> new DiplomaCertificateStatusResponse(cert.getId(), cert.getTitle(), false))
                .toList();

        return new DiplomaProgressResponse(
                diploma.getId(),
                diploma.getLabel(),
                requiredCount,
                completedCount,
                percentage,
                remaining,
                isCompleted,
                isClaimed,
                null,
                null,
                certStatus
        );
    }

    public List<DiplomaProgressResponse> getAllProgress(Long userId) {
        return diplomeRepo.findAllByOrderByIdDesc().stream()
                .map(diploma -> getProgress(userId, diploma.getId()))
                .toList();
    }

    public DiplomaClaimResponse claim(Long userId, Long diplomaId) {
        Diplome diploma = ensureDiplomaExists(diplomaId);

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        Instant claimedAt = Instant.now();
        String serialNumber = generateSerial(diplomaId, userId);
        notificationService.notifyRole(
                UserRole.ADMIN,
                "Diploma Claimed",
                user.getUserName() + " claimed diploma: " + diploma.getLabel(),
                "DIPLOMA_CLAIMED"
        );
        return new DiplomaClaimResponse(diplomaId, "Diploma claimed successfully", claimedAt, serialNumber);
    }

    private Diplome ensureDiplomaExists(Long diplomaId) {
        return diplomeRepo.findById(diplomaId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Diploma not found"));
    }

    private String generateSerial(Long diplomaId, Long userId) {
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "DIP-" + diplomaId + "-" + userId + "-" + randomPart;
    }

    private AdminDiplomaResponse toAdminResponse(Diplome diploma, long requiredCount) {
        return new AdminDiplomaResponse(
                diploma.getId(),
                diploma.getLabel(),
                diploma.getMode(),
                requiredCount
        );
    }
}
