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
import com.example._blog.Dto.admin.IssueStudentContextResponse;
import com.example._blog.Dto.admin.IssueStudentInfoResponse;
import com.example._blog.Dto.admin.IssueStudentSearchResponse;
import com.example._blog.Entity.Certificate;
import com.example._blog.Entity.Course;
import com.example._blog.Entity.Diplome;
import com.example._blog.Entity.IssuedCredential;
import com.example._blog.Entity.JoinRequest;
import com.example._blog.Entity.Specialization;
import com.example._blog.Entity.User;
import com.example._blog.Entity.enums.IssueType;
import com.example._blog.Entity.enums.JoinRequestStatus;
import com.example._blog.Repositories.CertificateRepo;
import com.example._blog.Repositories.CourseRepo;
import com.example._blog.Repositories.DiplomeRepo;
import com.example._blog.Repositories.IssuedCredentialRepo;
import com.example._blog.Repositories.JoinRequestRepo;
import com.example._blog.Repositories.SpecializationRepo;
import com.example._blog.Repositories.UserRepo;

@Service
public class IssueService {
    private final UserRepo userRepo;
    private final CertificateRepo certificateRepo;
    private final CourseRepo courseRepo;
    private final DiplomeRepo diplomeRepo;
    private final SpecializationRepo specializationRepo;
    private final JoinRequestRepo joinRequestRepo;
    private final IssuedCredentialRepo issuedCredentialRepo;

    public IssueService(
            UserRepo userRepo,
            CertificateRepo certificateRepo,
            CourseRepo courseRepo,
            DiplomeRepo diplomeRepo,
            SpecializationRepo specializationRepo,
            JoinRequestRepo joinRequestRepo,
            IssuedCredentialRepo issuedCredentialRepo
    ) {
        this.userRepo = userRepo;
        this.certificateRepo = certificateRepo;
        this.courseRepo = courseRepo;
        this.diplomeRepo = diplomeRepo;
        this.specializationRepo = specializationRepo;
        this.joinRequestRepo = joinRequestRepo;
        this.issuedCredentialRepo = issuedCredentialRepo;
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

        List<JoinRequest> accepted = joinRequestRepo.findAllByOrderByCreatedAtDesc().stream()
                .filter(r -> r.getUserId() != null && r.getUserId().equals(userId))
                .filter(r -> r.getStatus() == JoinRequestStatus.ACCEPTED)
                .toList();

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
                    List<String> courses = courseRepo.findByCertificateIdOrderByCreatedAtDesc(cert.getId()).stream()
                            .map(Course::getTitle)
                            .toList();
                    boolean completed = false;
                    boolean eligible = r.getStatus() == JoinRequestStatus.ACCEPTED || completed;
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

        List<Certificate> allCertificates = certificateRepo.findAllByOrderByCreatedAtDesc();
        List<IssueDiplomaOptionResponse> diplomaOptions = diplomeRepo.findAllByOrderByIdDesc().stream()
                .map(diploma -> {
                    List<String> specs = specializationRepo.findByDiplomaIdOrderByCreatedAtDesc(diploma.getId()).stream()
                            .map(Specialization::getTitle)
                            .toList();
                    List<String> summaryCourses = allCertificates.stream().map(Certificate::getTitle).toList();
                    boolean completed = false;
                    boolean acceptedState = completed;
                    boolean eligible = completed || acceptedState;
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
