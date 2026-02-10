package com.example._blog.Service;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.JoinRequestCreateRequest;
import com.example._blog.Dto.JoinRequestStatusResponse;
import com.example._blog.Dto.admin.AdminJoinRequestResponse;
import com.example._blog.Entity.Certificate;
import com.example._blog.Entity.Course;
import com.example._blog.Entity.JoinRequest;
import com.example._blog.Entity.User;
import com.example._blog.Entity.enums.JoinRequestStatus;
import com.example._blog.Entity.enums.UserRole;
import com.example._blog.Repositories.CertificateRepo;
import com.example._blog.Repositories.CourseRepo;
import com.example._blog.Repositories.DiplomaJoinRequestRepo;
import com.example._blog.Repositories.JoinRequestRepo;
import com.example._blog.Repositories.SpecializationRepo;
import com.example._blog.Repositories.UserRepo;
import com.example._blog.Entity.DiplomaJoinRequest;
import com.example._blog.Entity.Diplome;
import com.example._blog.Entity.Specialization;
import com.example._blog.Dto.DiplomaJoinRequestCreateRequest;

@Service
public class JoinRequestService {
    private final JoinRequestRepo joinRequestRepo;
    private final UserRepo userRepo;
    private final CertificateRepo certificateRepo;
    private final CourseRepo courseRepo;
    private final DiplomaJoinRequestRepo diplomaJoinRequestRepo;
    private final com.example._blog.Repositories.DiplomeRepo diplomeRepo;
    private final SpecializationRepo specializationRepo;
    private final NotificationService notificationService;

    public JoinRequestService(
            JoinRequestRepo joinRequestRepo,
            UserRepo userRepo,
            CertificateRepo certificateRepo,
            CourseRepo courseRepo,
            DiplomaJoinRequestRepo diplomaJoinRequestRepo,
            com.example._blog.Repositories.DiplomeRepo diplomeRepo,
            SpecializationRepo specializationRepo,
            NotificationService notificationService
    ) {
        this.joinRequestRepo = joinRequestRepo;
        this.userRepo = userRepo;
        this.certificateRepo = certificateRepo;
        this.courseRepo = courseRepo;
        this.diplomaJoinRequestRepo = diplomaJoinRequestRepo;
        this.diplomeRepo = diplomeRepo;
        this.specializationRepo = specializationRepo;
        this.notificationService = notificationService;
    }

    public AdminJoinRequestResponse create(Long userId, Long certificateId, JoinRequestCreateRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        Certificate certificate = certificateRepo.findById(certificateId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Certificate not found"));

        if (joinRequestRepo.existsByUserIdAndCertificateIdAndStatus(userId, certificateId, JoinRequestStatus.PENDING)) {
            throw new ResponseStatusException(CONFLICT, "You already have a pending join request for this certificate");
        }

        if (request == null || request.courseId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Course is required to join certificate");
        }

        Course course = courseRepo.findById(request.courseId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Course not found"));
        if (!certificateId.equals(course.getCertificateId())) {
            throw new ResponseStatusException(BAD_REQUEST, "Course does not belong to this certificate");
        }

        JoinRequest joinRequest = JoinRequest.builder()
                .user(user)
                .certificate(certificate)
                .course(course)
                .status(JoinRequestStatus.PENDING)
                .build();

        JoinRequest saved = joinRequestRepo.save(joinRequest);
        notificationService.notifyRole(
                UserRole.ADMIN,
                "New Join Request",
                user.getUserName() + " requested to join certificate \"" + certificate.getTitle()
                        + "\" course \"" + course.getTitle() + "\"",
                "JOIN_REQUEST"
        );
        return toResponse(saved);
    }

    public List<AdminJoinRequestResponse> getAllAdmin() {
        List<AdminJoinRequestResponse> certificateRequests = joinRequestRepo.findAllByOrderByCreatedAtDesc().stream()
                .filter(r -> r.getStatus() == JoinRequestStatus.PENDING)
                .map(this::toResponse)
                .toList();
        List<AdminJoinRequestResponse> diplomaRequests = diplomaJoinRequestRepo.findAllByOrderByCreatedAtDesc().stream()
                .filter(r -> r.getStatus() == JoinRequestStatus.PENDING)
                .map(this::toDiplomaResponse)
                .toList();
        return java.util.stream.Stream.concat(certificateRequests.stream(), diplomaRequests.stream())
                .sorted(java.util.Comparator.comparing(AdminJoinRequestResponse::requestedAt).reversed())
                .toList();
    }

    public AdminJoinRequestResponse accept(Long id) {
        JoinRequest request = getById(id);
        request.setStatus(JoinRequestStatus.ACCEPTED);
        JoinRequest saved = joinRequestRepo.save(request);
        notifyCertificateJoinResult(saved, true);
        return toResponse(saved);
    }

    public AdminJoinRequestResponse reject(Long id) {
        JoinRequest request = getById(id);
        request.setStatus(JoinRequestStatus.REJECTED);
        JoinRequest saved = joinRequestRepo.save(request);
        notifyCertificateJoinResult(saved, false);
        return toResponse(saved);
    }

    public AdminJoinRequestResponse createDiploma(Long userId, Long diplomaId, DiplomaJoinRequestCreateRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        Diplome diploma = diplomeRepo.findById(diplomaId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Diploma not found"));

        if (request == null || request.specializationId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Specialization is required to join diploma");
        }

        Specialization specialization = specializationRepo.findById(request.specializationId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Specialization not found"));
        if (!diplomaId.equals(specialization.getDiplomaId())) {
            throw new ResponseStatusException(BAD_REQUEST, "Specialization does not belong to this diploma");
        }

        if (diplomaJoinRequestRepo.existsByUserIdAndDiplomaIdAndSpecializationIdAndStatusIn(
                userId,
                diplomaId,
                specialization.getId(),
                java.util.List.of(JoinRequestStatus.PENDING, JoinRequestStatus.ACCEPTED)
        )) {
            throw new ResponseStatusException(CONFLICT, "Join request already pending/accepted for this specialization");
        }

        DiplomaJoinRequest joinRequest = DiplomaJoinRequest.builder()
                .user(user)
                .diploma(diploma)
                .specialization(specialization)
                .status(JoinRequestStatus.PENDING)
                .build();

        DiplomaJoinRequest saved = diplomaJoinRequestRepo.save(joinRequest);
        notificationService.notifyRole(
                UserRole.ADMIN,
                "New Join Request",
                user.getUserName() + " requested to join diploma \"" + diploma.getLabel()
                        + "\" specialization \"" + specialization.getTitle() + "\"",
                "JOIN_REQUEST"
        );
        return toDiplomaResponse(saved);
    }

    public AdminJoinRequestResponse acceptDiploma(Long id) {
        DiplomaJoinRequest request = diplomaJoinRequestRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Diploma join request not found"));
        request.setStatus(JoinRequestStatus.ACCEPTED);
        DiplomaJoinRequest saved = diplomaJoinRequestRepo.save(request);
        notifyDiplomaJoinResult(saved, true);
        return toDiplomaResponse(saved);
    }

    public AdminJoinRequestResponse rejectDiploma(Long id) {
        DiplomaJoinRequest request = diplomaJoinRequestRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Diploma join request not found"));
        request.setStatus(JoinRequestStatus.REJECTED);
        DiplomaJoinRequest saved = diplomaJoinRequestRepo.save(request);
        notifyDiplomaJoinResult(saved, false);
        return toDiplomaResponse(saved);
    }

    public JoinRequestStatusResponse getCertificateJoinStatus(Long userId, Long certificateId) {
        return joinRequestRepo.findTopByUserIdAndCertificateIdOrderByCreatedAtDesc(userId, certificateId)
                .map(r -> new JoinRequestStatusResponse("CERTIFICATE", r.getStatus(), r.getCreatedAt()))
                .orElse(null);
    }

    public JoinRequestStatusResponse getDiplomaJoinStatus(Long userId, Long diplomaId) {
        return diplomaJoinRequestRepo.findTopByUserIdAndDiplomaIdOrderByCreatedAtDesc(userId, diplomaId)
                .map(r -> new JoinRequestStatusResponse("DIPLOMA", r.getStatus(), r.getCreatedAt()))
                .orElse(null);
    }

    private void notifyCertificateJoinResult(JoinRequest request, boolean accepted) {
        User student = request.getUser();
        if (student == null) {
            return;
        }

        String title = accepted ? "Join Request Accepted" : "Join Request Rejected";
        String action = accepted ? "accepted" : "rejected";
        String certificateTitle = request.getCertificate() == null ? "certificate" : request.getCertificate().getTitle();
        String courseTitle = request.getCourse() == null ? "course" : request.getCourse().getTitle();
        notificationService.notifyUser(
                student,
                title,
                "Your request for " + certificateTitle + " (" + courseTitle + ") was " + action + ".",
                "JOIN_REQUEST_RESULT"
        );
    }

    private void notifyDiplomaJoinResult(DiplomaJoinRequest request, boolean accepted) {
        User student = request.getUser();
        if (student == null) {
            return;
        }

        String title = accepted ? "Join Request Accepted" : "Join Request Rejected";
        String action = accepted ? "accepted" : "rejected";
        String diplomaTitle = request.getDiploma() == null ? "diploma" : request.getDiploma().getLabel();
        String specializationTitle = request.getSpecialization() == null
                ? "specialization"
                : request.getSpecialization().getTitle();
        notificationService.notifyUser(
                student,
                title,
                "Your request for " + diplomaTitle + " (" + specializationTitle + ") was " + action + ".",
                "JOIN_REQUEST_RESULT"
        );
    }

    private JoinRequest getById(Long id) {
        return joinRequestRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Join request not found"));
    }

    private AdminJoinRequestResponse toResponse(JoinRequest request) {
        return new AdminJoinRequestResponse(
                request.getId(),
                "CERTIFICATE",
                request.getUserId(),
                request.getUser() == null ? null : request.getUser().getUserName(),
                request.getUser() == null ? null : request.getUser().getEmail(),
                request.getCertificateId(),
                request.getCertificate() == null ? null : request.getCertificate().getTitle(),
                request.getCourseId(),
                request.getCourse() == null ? null : request.getCourse().getTitle(),
                null,
                null,
                null,
                null,
                request.getStatus(),
                request.getCreatedAt()
        );
    }

    private AdminJoinRequestResponse toDiplomaResponse(DiplomaJoinRequest request) {
        return new AdminJoinRequestResponse(
                request.getId(),
                "DIPLOMA",
                request.getUserId(),
                request.getUser() == null ? null : request.getUser().getUserName(),
                request.getUser() == null ? null : request.getUser().getEmail(),
                null,
                null,
                null,
                null,
                request.getDiplomaId(),
                request.getDiploma() == null ? null : request.getDiploma().getLabel(),
                request.getSpecializationId(),
                request.getSpecialization() == null ? null : request.getSpecialization().getTitle(),
                request.getStatus(),
                request.getCreatedAt()
        );
    }
}
