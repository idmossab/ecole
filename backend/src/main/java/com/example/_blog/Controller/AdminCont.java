package com.example._blog.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example._blog.Dto.admin.AdminCertificateRequest;
import com.example._blog.Dto.admin.AdminCertificateResponse;
import com.example._blog.Dto.admin.AdminCourseRequest;
import com.example._blog.Dto.admin.AdminCourseResponse;
import com.example._blog.Entity.enums.UserRole;
import com.example._blog.Repositories.CertificateRepo;
import com.example._blog.Repositories.CourseRepo;
import com.example._blog.Repositories.UserRepo;
import com.example._blog.Service.CertificateService;
import com.example._blog.Service.CourseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@Validated
public class AdminCont {
    private final CertificateService certificateService;
    private final CourseService courseService;
    private final CertificateRepo certificateRepo;
    private final CourseRepo courseRepo;
    private final UserRepo userRepo;

    public AdminCont(
            CertificateService certificateService,
            CourseService courseService,
            CertificateRepo certificateRepo,
            CourseRepo courseRepo,
            UserRepo userRepo
    ) {
        this.certificateService = certificateService;
        this.courseService = courseService;
        this.certificateRepo = certificateRepo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        long totalStudents = userRepo.countByRole(UserRole.USER);
        long totalCourses = courseRepo.count();
        long totalCertificates = certificateRepo.count();
        return ResponseEntity.ok(new AdminStatsResponse(totalStudents, totalCourses, totalCertificates));
    }

    @PostMapping("/certificates")
    public ResponseEntity<AdminCertificateResponse> createCertificate(@Valid @RequestBody AdminCertificateRequest request) {
        return ResponseEntity.ok(certificateService.create(request));
    }

    @GetMapping("/certificates")
    public ResponseEntity<List<AdminCertificateResponse>> getCertificates() {
        return ResponseEntity.ok(certificateService.getAllAdmin());
    }

    @PutMapping("/certificates/{id}")
    public ResponseEntity<AdminCertificateResponse> updateCertificate(
            @PathVariable Long id,
            @Valid @RequestBody AdminCertificateRequest request
    ) {
        return ResponseEntity.ok(certificateService.update(id, request));
    }

    @DeleteMapping("/certificates/{id}")
    public ResponseEntity<Void> deleteCertificate(@PathVariable Long id) {
        certificateService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/certificates/{certificateId}/courses")
    public ResponseEntity<AdminCourseResponse> createCourse(
            @PathVariable Long certificateId,
            @Valid @RequestBody AdminCourseRequest request
    ) {
        return ResponseEntity.ok(courseService.create(certificateId, request));
    }

    @GetMapping("/certificates/{certificateId}/courses")
    public ResponseEntity<List<AdminCourseResponse>> getCertificateCourses(@PathVariable Long certificateId) {
        return ResponseEntity.ok(courseService.getByCertificateAdmin(certificateId));
    }

    @PutMapping("/courses/{courseId}")
    public ResponseEntity<AdminCourseResponse> updateCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody AdminCourseRequest request
    ) {
        return ResponseEntity.ok(courseService.update(courseId, request));
    }

    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
        courseService.delete(courseId);
        return ResponseEntity.noContent().build();
    }

    public record AdminStatsResponse(long totalStudents, long totalCourses, long totalCertificates) {}
}
