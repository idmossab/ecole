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
import com.example._blog.Dto.admin.AdminSpecializationRequest;
import com.example._blog.Dto.admin.AdminSpecializationResponse;
import com.example._blog.Entity.enums.UserRole;
import com.example._blog.Repositories.CertificateRepo;
import com.example._blog.Repositories.CourseRepo;
import com.example._blog.Repositories.UserRepo;
import com.example._blog.Service.CertificateService;
import com.example._blog.Service.CourseService;
import com.example._blog.Service.SpecializationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AdminCont {
    private final UserRepo userRepo;
    private final CourseRepo courseRepo;
    private final CertificateRepo certificateRepo;
    private final CertificateService certificateService;
    private final CourseService courseService;
    private final SpecializationService specializationService;

    public AdminCont(
            UserRepo userRepo,
            CourseRepo courseRepo,
            CertificateRepo certificateRepo,
            CertificateService certificateService,
            CourseService courseService,
            SpecializationService specializationService
    ) {
        this.userRepo = userRepo;
        this.courseRepo = courseRepo;
        this.certificateRepo = certificateRepo;
        this.certificateService = certificateService;
        this.courseService = courseService;
        this.specializationService = specializationService;
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

    @GetMapping("/diplomas/{diplomaId}/specializations")
    public List<AdminSpecializationResponse> getSpecializations(@PathVariable Long diplomaId) {
        return specializationService.getByDiplomaAdmin(diplomaId);
    }

    @PostMapping("/diplomas/{diplomaId}/specializations")
    public AdminSpecializationResponse createSpecialization(
            @PathVariable Long diplomaId,
            @Valid @RequestBody AdminSpecializationRequest request
    ) {
        return specializationService.create(diplomaId, request);
    }

    @PutMapping("/specializations/{specializationId}")
    public AdminSpecializationResponse updateSpecialization(
            @PathVariable Long specializationId,
            @Valid @RequestBody AdminSpecializationRequest request
    ) {
        return specializationService.update(specializationId, request);
    }

    @DeleteMapping("/specializations/{specializationId}")
    public void deleteSpecialization(@PathVariable Long specializationId) {
        specializationService.delete(specializationId);
    }

    public record AdminStatsResponse(long totalStudents, long totalCourses, long totalCertificates) {}
}
