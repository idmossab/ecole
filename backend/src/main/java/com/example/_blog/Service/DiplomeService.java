package com.example._blog.Service;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.DiplomaCertificateStatusResponse;
import com.example._blog.Dto.DiplomaClaimResponse;
import com.example._blog.Dto.DiplomaProgressResponse;
import com.example._blog.Dto.DiplomaSummaryResponse;
import com.example._blog.Entity.Certificate;
import com.example._blog.Entity.DiplomaRequirement;
import com.example._blog.Entity.Diplome;
import com.example._blog.Entity.User;
import com.example._blog.Entity.UserCertificate;
import com.example._blog.Entity.UserDiploma;
import com.example._blog.Repositories.CertificateRepo;
import com.example._blog.Repositories.DiplomaRequirementRepo;
import com.example._blog.Repositories.DiplomeRepo;
import com.example._blog.Repositories.UserCertificateRepo;
import com.example._blog.Repositories.UserDiplomaRepo;
import com.example._blog.Repositories.UserRepo;

@Service
public class DiplomeService {
    private final DiplomeRepo diplomeRepo;
    private final CertificateRepo certificateRepo;
    private final DiplomaRequirementRepo diplomaRequirementRepo;
    private final UserCertificateRepo userCertificateRepo;
    private final UserDiplomaRepo userDiplomaRepo;
    private final UserRepo userRepo;

    public DiplomeService(
            DiplomeRepo diplomeRepo,
            CertificateRepo certificateRepo,
            DiplomaRequirementRepo diplomaRequirementRepo,
            UserCertificateRepo userCertificateRepo,
            UserDiplomaRepo userDiplomaRepo,
            UserRepo userRepo
    ) {
        this.diplomeRepo = diplomeRepo;
        this.certificateRepo = certificateRepo;
        this.diplomaRequirementRepo = diplomaRequirementRepo;
        this.userCertificateRepo = userCertificateRepo;
        this.userDiplomaRepo = userDiplomaRepo;
        this.userRepo = userRepo;
    }

    public Diplome createDiploma(String title, List<Long> certificateIds) {
        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Diploma title is required");
        }
        if (diplomeRepo.existsByLabel(title.trim())) {
            throw new ResponseStatusException(CONFLICT, "Diploma title already exists");
        }
        if (certificateIds == null || certificateIds.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "At least one certificate is required");
        }

        Diplome diploma = diplomeRepo.save(Diplome.builder().label(title.trim()).build());
        List<Certificate> certificates = certificateRepo.findAllById(certificateIds);
        if (certificates.size() != certificateIds.size()) {
            throw new ResponseStatusException(BAD_REQUEST, "One or more certificates are invalid");
        }
        List<DiplomaRequirement> requirements = certificates.stream()
                .map(cert -> DiplomaRequirement.builder().diploma(diploma).certificate(cert).build())
                .toList();
        diplomaRequirementRepo.saveAll(requirements);
        return diploma;
    }

    public List<DiplomaSummaryResponse> getAllDiplomas() {
        return diplomeRepo.findAllByOrderByIdDesc().stream()
                .map(diploma -> new DiplomaSummaryResponse(
                        diploma.getId(),
                        diploma.getLabel(),
                        diplomaRequirementRepo.findByDiplomaId(diploma.getId()).size()
                ))
                .toList();
    }

    public DiplomaSummaryResponse getDiplomaById(Long diplomaId) {
        Diplome diploma = diplomeRepo.findById(diplomaId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Diploma not found"));
        long requiredCount = diplomaRequirementRepo.findByDiplomaId(diplomaId).size();
        return new DiplomaSummaryResponse(diploma.getId(), diploma.getLabel(), requiredCount);
    }

    public List<DiplomaCertificateStatusResponse> getDiplomaCertificates(Long diplomaId) {
        ensureDiplomaExists(diplomaId);
        return diplomaRequirementRepo.findByDiplomaId(diplomaId).stream()
                .map(req -> new DiplomaCertificateStatusResponse(
                        req.getCertificate().getId(),
                        req.getCertificate().getTitle(),
                        false
                ))
                .toList();
    }

    public DiplomaProgressResponse getProgress(Long userId, Long diplomaId) {
        Diplome diploma = ensureDiplomaExists(diplomaId);
        List<DiplomaRequirement> requirements = diplomaRequirementRepo.findByDiplomaId(diplomaId);
        Set<Long> claimedCertIds = userCertificateRepo.findClaimedCertificateIdsByUserId(userId).stream()
                .collect(Collectors.toSet());

        long requiredCount = requirements.size();
        long completedCount = requirements.stream()
                .map(req -> req.getCertificate().getId())
                .filter(claimedCertIds::contains)
                .count();
        long remaining = Math.max(0, requiredCount - completedCount);
        int percentage = requiredCount > 0
                ? (int) Math.round((completedCount * 100.0) / requiredCount)
                : 0;
        boolean isCompleted = requiredCount > 0 && completedCount == requiredCount;
        UserDiploma claimed = userDiplomaRepo.findByUserUserIdAndDiplomaId(userId, diplomaId).orElse(null);
        boolean isClaimed = claimed != null;

        List<DiplomaCertificateStatusResponse> certStatus = requirements.stream()
                .map(req -> {
                    Certificate cert = req.getCertificate();
                    return new DiplomaCertificateStatusResponse(
                            cert.getId(),
                            cert.getTitle(),
                            claimedCertIds.contains(cert.getId())
                    );
                })
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
                claimed == null ? null : claimed.getSerialNumber(),
                claimed == null ? null : claimed.getClaimedAt(),
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
        DiplomaProgressResponse progress = getProgress(userId, diplomaId);
        if (!progress.isCompleted()) {
            throw new ResponseStatusException(BAD_REQUEST, "Complete required certificates first to get this diploma.");
        }

        UserDiploma existing = userDiplomaRepo.findByUserUserIdAndDiplomaId(userId, diplomaId).orElse(null);
        if (existing != null) {
            return new DiplomaClaimResponse(diplomaId, "Diploma already claimed", existing.getClaimedAt(), existing.getSerialNumber());
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        UserDiploma created = userDiplomaRepo.save(UserDiploma.builder()
                .user(user)
                .diploma(diploma)
                .claimedAt(Instant.now())
                .serialNumber(generateSerial(diplomaId, userId))
                .build());
        return new DiplomaClaimResponse(diplomaId, "Diploma claimed successfully", created.getClaimedAt(), created.getSerialNumber());
    }

    private Diplome ensureDiplomaExists(Long diplomaId) {
        return diplomeRepo.findById(diplomaId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Diploma not found"));
    }

    private String generateSerial(Long diplomaId, Long userId) {
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "DIP-" + diplomaId + "-" + userId + "-" + randomPart;
    }
}
