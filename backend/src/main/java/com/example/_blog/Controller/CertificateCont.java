package com.example._blog.Controller;

import java.util.List;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.JoinRequestCreateRequest;
import com.example._blog.Dto.admin.AdminJoinRequestResponse;
import com.example._blog.Entity.Certificate;
import com.example._blog.Entity.Course;
import com.example._blog.Security.UserPrincipal;
import com.example._blog.Service.CertificateService;
import com.example._blog.Service.CourseService;
import com.example._blog.Service.JoinRequestService;

@RestController
public class CertificateCont {
    private final CertificateService certificateService;
    private final CourseService courseService;
    private final JoinRequestService joinRequestService;

    public CertificateCont(
            CertificateService certificateService,
            CourseService courseService,
            JoinRequestService joinRequestService
    ) {
        this.certificateService = certificateService;
        this.courseService = courseService;
        this.joinRequestService = joinRequestService;
    }

    @GetMapping("/certificates")
    public List<Certificate> getCertificates() {
        return certificateService.getAllPublic();
    }

    @GetMapping("/certificates/{certificateId}")
    public Certificate getCertificateById(@PathVariable Long certificateId) {
        return certificateService.getById(certificateId);
    }

    @GetMapping("/certificates/{certificateId}/courses")
    public List<Course> getCertificateCourses(@PathVariable Long certificateId) {
        return courseService.getByCertificatePublic(certificateId);
    }

    @GetMapping("/courses/{courseId}")
    public Course getCourseById(@PathVariable Long courseId) {
        return courseService.getById(courseId);
    }

    @PostMapping("/api/certificates/{certificateId}/join-requests")
    public AdminJoinRequestResponse createJoinRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long certificateId,
            @RequestBody(required = false) JoinRequestCreateRequest request
    ) {
        return joinRequestService.create(requireUserId(principal), certificateId, request);
    }

    private Long requireUserId(UserPrincipal principal) {
        if (principal == null || principal.getUser() == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Unauthorized");
        }
        return principal.getUser().getUserId();
    }
}
