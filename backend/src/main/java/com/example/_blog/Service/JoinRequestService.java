package com.example._blog.Service;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.JoinRequestCreateRequest;
import com.example._blog.Dto.admin.AdminJoinRequestResponse;
import com.example._blog.Entity.Certificate;
import com.example._blog.Entity.Course;
import com.example._blog.Entity.JoinRequest;
import com.example._blog.Entity.User;
import com.example._blog.Entity.enums.JoinRequestStatus;
import com.example._blog.Repositories.CertificateRepo;
import com.example._blog.Repositories.CourseRepo;
import com.example._blog.Repositories.JoinRequestRepo;
import com.example._blog.Repositories.UserRepo;

@Service
public class JoinRequestService {
    private final JoinRequestRepo joinRequestRepo;
    private final UserRepo userRepo;
    private final CertificateRepo certificateRepo;
    private final CourseRepo courseRepo;

    public JoinRequestService(
            JoinRequestRepo joinRequestRepo,
            UserRepo userRepo,
            CertificateRepo certificateRepo,
            CourseRepo courseRepo
    ) {
        this.joinRequestRepo = joinRequestRepo;
        this.userRepo = userRepo;
        this.certificateRepo = certificateRepo;
        this.courseRepo = courseRepo;
    }

    public AdminJoinRequestResponse create(Long userId, Long certificateId, JoinRequestCreateRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        Certificate certificate = certificateRepo.findById(certificateId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Certificate not found"));

        if (joinRequestRepo.existsByUserIdAndCertificateIdAndStatus(userId, certificateId, JoinRequestStatus.PENDING)) {
            throw new ResponseStatusException(CONFLICT, "You already have a pending join request for this certificate");
        }

        Course course = null;
        if (request != null && request.courseId() != null) {
            course = courseRepo.findById(request.courseId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Course not found"));
            if (!certificateId.equals(course.getCertificateId())) {
                throw new ResponseStatusException(BAD_REQUEST, "Course does not belong to this certificate");
            }
        }

        JoinRequest joinRequest = JoinRequest.builder()
                .user(user)
                .certificate(certificate)
                .course(course)
                .status(JoinRequestStatus.PENDING)
                .build();

        return toResponse(joinRequestRepo.save(joinRequest));
    }

    public List<AdminJoinRequestResponse> getAllAdmin() {
        return joinRequestRepo.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminJoinRequestResponse accept(Long id) {
        JoinRequest request = getById(id);
        request.setStatus(JoinRequestStatus.ACCEPTED);
        return toResponse(joinRequestRepo.save(request));
    }

    public AdminJoinRequestResponse reject(Long id) {
        JoinRequest request = getById(id);
        request.setStatus(JoinRequestStatus.REJECTED);
        return toResponse(joinRequestRepo.save(request));
    }

    private JoinRequest getById(Long id) {
        return joinRequestRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Join request not found"));
    }

    private AdminJoinRequestResponse toResponse(JoinRequest request) {
        return new AdminJoinRequestResponse(
                request.getId(),
                request.getUserId(),
                request.getUser() == null ? null : request.getUser().getUserName(),
                request.getUser() == null ? null : request.getUser().getEmail(),
                request.getCertificateId(),
                request.getCertificate() == null ? null : request.getCertificate().getTitle(),
                request.getCourseId(),
                request.getCourse() == null ? null : request.getCourse().getTitle(),
                request.getStatus(),
                request.getCreatedAt()
        );
    }
}
