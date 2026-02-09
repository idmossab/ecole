package com.example._blog.Controller;

import java.util.List;

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
public class AdminCont {
    private final UserRepo userRepo;
    private final CourseRepo courseRepo;
    private final CertificateRepo certificateRepo;
    private final CertificateService certificateService;
    private final CourseService courseService;

    public AdminCont(
            UserRepo userRepo,
            CourseRepo courseRepo,
            CertificateRepo certificateRepo,
            CertificateService certificateService,
            CourseService courseService
    ) {
        this.userRepo = userRepo;
        this.courseRepo = courseRepo;
        this.certificateRepo = certificateRepo;
        this.certificateService = certificateService;
        this.courseService = courseService;
    }

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        return new AdminStatsResponse(
                userRepo.countByRole(UserRole.USER),
                courseRepo.count(),
                certificateRepo.count()
        );
    }

    @GetMapping("/certificates")
    public List<AdminCertificateResponse> getCertificates() {
        return certificateService.getAllAdmin();
    }

    @PostMapping("/certificates")
    public AdminCertificateResponse createCertificate(@Valid @RequestBody AdminCertificateRequest request) {
        return certificateService.create(request);
    }

    @PutMapping("/certificates/{id}")
    public AdminCertificateResponse updateCertificate(
            @PathVariable Long id,
            @Valid @RequestBody AdminCertificateRequest request
    ) {
        return certificateService.update(id, request);
    }

    @DeleteMapping("/certificates/{id}")
    public void deleteCertificate(@PathVariable Long id) {
        certificateService.delete(id);
    }

    @GetMapping("/certificates/{certificateId}/courses")
    public List<AdminCourseResponse> getCourses(@PathVariable Long certificateId) {
        return courseService.getByCertificateAdmin(certificateId);
    }

    @PostMapping("/certificates/{certificateId}/courses")
    public AdminCourseResponse createCourse(
            @PathVariable Long certificateId,
            @Valid @RequestBody AdminCourseRequest request
    ) {
        return courseService.create(certificateId, request);
    }

    @PutMapping("/courses/{courseId}")
    public AdminCourseResponse updateCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody AdminCourseRequest request
    ) {
        return courseService.update(courseId, request);
    }

    @DeleteMapping("/courses/{courseId}")
    public void deleteCourse(@PathVariable Long courseId) {
        courseService.delete(courseId);
    }

    public record AdminStatsResponse(long totalStudents, long totalCourses, long totalCertificates) {}
}
