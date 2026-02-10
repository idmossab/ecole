package com.example._blog.Service;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.admin.IssueCertificateOptionResponse;
import com.example._blog.Dto.admin.IssueDiplomaOptionResponse;
import com.example._blog.Dto.admin.IssueGenerateRequest;
import com.example._blog.Dto.admin.IssueGenerateResponse;
import com.example._blog.Dto.admin.IssueRecentResponse;
import com.example._blog.Dto.admin.IssueStatsResponse;
import com.example._blog.Dto.admin.IssueStudentContextResponse;
import com.example._blog.Dto.admin.IssueStudentInfoResponse;
import com.example._blog.Dto.admin.IssueStudentSearchResponse;
import com.example._blog.Entity.Certificate;
import com.example._blog.Entity.Course;
import com.example._blog.Entity.Diplome;
import com.example._blog.Entity.DiplomaJoinRequest;
import com.example._blog.Entity.IssuedCredential;
import com.example._blog.Entity.JoinRequest;
import com.example._blog.Entity.Specialization;
import com.example._blog.Entity.User;
import com.example._blog.Entity.enums.IssueType;
import com.example._blog.Entity.enums.JoinRequestStatus;
import com.example._blog.Repositories.CertificateRepo;
import com.example._blog.Repositories.CourseRepo;
import com.example._blog.Repositories.DiplomaJoinRequestRepo;
import com.example._blog.Repositories.DiplomeRepo;
import com.example._blog.Repositories.IssuedCredentialRepo;
import com.example._blog.Repositories.JoinRequestRepo;
import com.example._blog.Repositories.UserRepo;

@Service
public class IssueService {
    private final UserRepo userRepo;
    private final CertificateRepo certificateRepo;
    private final DiplomeRepo diplomeRepo;
    private final JoinRequestRepo joinRequestRepo;
    private final DiplomaJoinRequestRepo diplomaJoinRequestRepo;
    private final IssuedCredentialRepo issuedCredentialRepo;

    public IssueService(
            UserRepo userRepo,
            CertificateRepo certificateRepo,
            DiplomeRepo diplomeRepo,
            JoinRequestRepo joinRequestRepo,
            DiplomaJoinRequestRepo diplomaJoinRequestRepo,
            IssuedCredentialRepo issuedCredentialRepo
    ) {
        this.userRepo = userRepo;
        this.certificateRepo = certificateRepo;
        this.diplomeRepo = diplomeRepo;
        this.joinRequestRepo = joinRequestRepo;
        this.diplomaJoinRequestRepo = diplomaJoinRequestRepo;
        this.issuedCredentialRepo = issuedCredentialRepo;
    }

    public IssueStatsResponse getStats() {
        return new IssueStatsResponse(
                joinRequestRepo.countAcceptedActiveCertificateJoins(),
                diplomaJoinRequestRepo.countAcceptedActiveDiplomaJoins(),
                issuedCredentialRepo.countByType(IssueType.DIPLOMA),
                issuedCredentialRepo.countByType(IssueType.CERTIFICATE)
        );
    }

    public List<IssueStudentSearchResponse> searchStudents(String query) {
        if (query == null || query.isBlank()) return List.of();
        return userRepo.searchStudents(query.trim()).stream()
                .limit(20)
                .map(u -> new IssueStudentSearchResponse(
                        u.getUserId(),
                        (u.getFirstName() + " " + u.getLastName()).trim(),
                        u.getUserName(),
                        u.getEmail()
                ))
                .toList();
    }

    public IssueStudentContextResponse getStudentContext(Long userId) {
        User student = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Student not found"));

        IssueStudentInfoResponse studentInfo = new IssueStudentInfoResponse(
                student.getUserId(),
                (student.getFirstName() + " " + student.getLastName()).trim(),
                student.getUserName(),
                student.getEmail(),
                student.getPhone(),
                student.getCity()
        );

        List<JoinRequest> accepted = joinRequestRepo.findByUserIdAndStatusOrderByCreatedAtDesc(
                userId,
                JoinRequestStatus.ACCEPTED
        );

        List<IssueCertificateOptionResponse> certificateOptions = accepted.stream()
                .filter(r -> r.getCertificate() != null)
                .collect(java.util.stream.Collectors.toMap(
                        JoinRequest::getCertificateId,
                        r -> r,
                        (a, b) -> a,
                        java.util.LinkedHashMap::new
                ))
                .values()
                .stream()
                .map(r -> {
                    Certificate cert = r.getCertificate();
                    List<String> courses = accepted.stream()
                            .filter(x -> cert.getId().equals(x.getCertificateId()))
                            .map(JoinRequest::getCourse)
                            .filter(java.util.Objects::nonNull)
                            .map(Course::getTitle)
                            .distinct()
                            .toList();
                    boolean completed = false;
                    boolean eligible = true;
                    boolean alreadyIssued = issuedCredentialRepo.existsByUserIdAndTypeAndCertificateId(
                            userId,
                            IssueType.CERTIFICATE,
                            cert.getId()
                    );
                    return new IssueCertificateOptionResponse(
                            cert.getId(),
                            cert.getTitle(),
                            true,
                            completed,
                            eligible,
                            alreadyIssued,
                            courses
                    );
                })
                .sorted(Comparator.comparing(IssueCertificateOptionResponse::title))
                .toList();

        List<DiplomaJoinRequest> acceptedDiploma = diplomaJoinRequestRepo
                .findByUserIdAndStatusOrderByCreatedAtDesc(userId, JoinRequestStatus.ACCEPTED)
                .stream()
                .filter(r -> r.getSpecializationId() != null)
                .toList();

        List<IssueDiplomaOptionResponse> diplomaOptions = acceptedDiploma.stream()
                .collect(java.util.stream.Collectors.toMap(
                        DiplomaJoinRequest::getDiplomaId,
                        r -> r,
                        (a, b) -> a,
                        java.util.LinkedHashMap::new
                ))
                .values()
                .stream()
                .map(req -> {
                    Diplome diploma = req.getDiploma();
                    List<String> specs = acceptedDiploma.stream()
                            .filter(x -> diploma.getId().equals(x.getDiplomaId()))
                            .map(DiplomaJoinRequest::getSpecialization)
                            .filter(java.util.Objects::nonNull)
                            .map(Specialization::getTitle)
                            .distinct()
                            .toList();
                    List<String> summaryCourses = specs;
                    boolean completed = false;
                    boolean acceptedState = !specs.isEmpty();
                    boolean eligible = acceptedState || completed;
                    boolean alreadyIssued = issuedCredentialRepo.existsByUserIdAndTypeAndDiplomaId(
                            userId,
                            IssueType.DIPLOMA,
                            diploma.getId()
                    );
                    return new IssueDiplomaOptionResponse(
                        diploma.getId(),
                            diploma.getLabel(),
                            acceptedState,
                            completed,
                            eligible,
                            alreadyIssued,
                            specs,
                            summaryCourses
                    );
                })
                .sorted(Comparator.comparing(IssueDiplomaOptionResponse::title))
                .toList();

        List<IssueRecentResponse> recentlyIssued = issuedCredentialRepo.findTop10ByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(item -> new IssueRecentResponse(
                        item.getId(),
                        item.getType() == IssueType.CERTIFICATE
                                ? (item.getCertificate() == null ? "Certificate" : item.getCertificate().getTitle())
                                : (item.getDiploma() == null ? "Diploma" : item.getDiploma().getLabel()),
                        (student.getFirstName() + " " + student.getLastName()).trim(),
                        item.getSerialNumber(),
                        item.getIssueDate(),
                        item.getType().name()
                ))
                .toList();

        return new IssueStudentContextResponse(studentInfo, certificateOptions, diplomaOptions, recentlyIssued);
    }

    public IssueGenerateResponse generate(IssueGenerateRequest request) {
        User user = userRepo.findById(request.userId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Student not found"));

        if (request.issueDate() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Issue date is required");
        }

        IssueType type;
        try {
            type = IssueType.valueOf(request.type().trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid issue type");
        }

        IssuedCredential entity = IssuedCredential.builder()
                .user(user)
                .type(type)
                .issueDate(request.issueDate())
                .build();

        if (type == IssueType.CERTIFICATE) {
            if (request.certificateId() == null) {
                throw new ResponseStatusException(BAD_REQUEST, "Certificate is required");
            }
            Certificate cert = certificateRepo.findById(request.certificateId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Certificate not found"));
            if (issuedCredentialRepo.existsByUserIdAndTypeAndCertificateId(user.getUserId(), IssueType.CERTIFICATE, cert.getId())) {
                throw new ResponseStatusException(CONFLICT, "Already issued");
            }
            boolean hasAcceptedCourseJoin = joinRequestRepo.findByUserIdAndStatusOrderByCreatedAtDesc(user.getUserId(), JoinRequestStatus.ACCEPTED)
                    .stream()
                    .anyMatch(r -> cert.getId().equals(r.getCertificateId()) && r.getCourseId() != null);
            if (!hasAcceptedCourseJoin) {
                throw new ResponseStatusException(BAD_REQUEST, "Student is not accepted in a course for this certificate");
            }
            entity.setCertificate(cert);
            entity.setSerialNumber(generateSerial("CERT", cert.getId(), user.getUserId()));
        } else {
            if (request.diplomaId() == null) {
                throw new ResponseStatusException(BAD_REQUEST, "Diploma is required");
            }
            Diplome diploma = diplomeRepo.findById(request.diplomaId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Diploma not found"));
            if (issuedCredentialRepo.existsByUserIdAndTypeAndDiplomaId(user.getUserId(), IssueType.DIPLOMA, diploma.getId())) {
                throw new ResponseStatusException(CONFLICT, "Already issued");
            }
            boolean hasAcceptedSpecJoin = diplomaJoinRequestRepo.findByUserIdAndStatusOrderByCreatedAtDesc(user.getUserId(), JoinRequestStatus.ACCEPTED)
                    .stream()
                    .anyMatch(r -> diploma.getId().equals(r.getDiplomaId()) && r.getSpecializationId() != null);
            if (!hasAcceptedSpecJoin) {
                throw new ResponseStatusException(BAD_REQUEST, "Student is not accepted in a specialization for this diploma");
            }
            entity.setDiploma(diploma);
            entity.setSerialNumber(generateSerial("DIP", diploma.getId(), user.getUserId()));
        }

        String qrPayload = "ISSUE:" + entity.getSerialNumber() + ":" + entity.getIssueDate();
        entity.setQrPayload(qrPayload);
        entity.setDocumentUrl("/documents/issued/" + entity.getSerialNumber());

        IssuedCredential saved = issuedCredentialRepo.save(entity);
        return new IssueGenerateResponse(
                saved.getId(),
                saved.getSerialNumber(),
                saved.getIssueDate(),
                saved.getQrPayload(),
                saved.getDocumentUrl()
        );
    }

    private String generateSerial(String prefix, Long itemId, Long userId) {
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return prefix + "-" + itemId + "-" + userId + "-" + randomPart;
    }
}
