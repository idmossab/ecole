package com.example._blog.Controller;

import java.util.List;
import java.util.UUID;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.admin.AdminCertificateRequest;
import com.example._blog.Dto.admin.AdminCertificateResponse;
import com.example._blog.Dto.admin.AdminCourseRequest;
import com.example._blog.Dto.admin.AdminCourseResponse;
import com.example._blog.Dto.admin.AdminDiplomaRequest;
import com.example._blog.Dto.admin.AdminDiplomaResponse;
import com.example._blog.Dto.admin.AdminSpecializationRequest;
import com.example._blog.Dto.admin.AdminSpecializationResponse;
import com.example._blog.Dto.admin.AdminUserRoleRequest;
import com.example._blog.Dto.admin.AdminJoinRequestResponse;
import com.example._blog.Dto.admin.IssueGenerateRequest;
import com.example._blog.Dto.admin.IssueGenerateResponse;
import com.example._blog.Dto.admin.IssueStudentContextResponse;
import com.example._blog.Dto.admin.IssueStudentSearchResponse;
import com.example._blog.Dto.UserResponse;
import com.example._blog.Entity.enums.UserRole;
import com.example._blog.Repositories.CertificateRepo;
import com.example._blog.Repositories.CourseRepo;
import com.example._blog.Repositories.DiplomeRepo;
import com.example._blog.Repositories.UserRepo;
import com.example._blog.Service.CertificateService;
import com.example._blog.Service.CourseService;
import com.example._blog.Service.DiplomeService;
import com.example._blog.Service.SpecializationService;
import com.example._blog.Service.UserService;
import com.example._blog.Service.JoinRequestService;
import com.example._blog.Service.IssueService;
import com.example._blog.Security.UserPrincipal;

import jakarta.validation.Valid;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@RestController
@RequestMapping("/api/admin")
public class AdminCont {
    private final UserRepo userRepo;
    private final CourseRepo courseRepo;
    private final CertificateRepo certificateRepo;
    private final DiplomeRepo diplomeRepo;
    private final CertificateService certificateService;
    private final CourseService courseService;
    private final SpecializationService specializationService;
    private final DiplomeService diplomeService;
    private final UserService userService;
    private final JoinRequestService joinRequestService;
    private final IssueService issueService;

    public AdminCont(
            UserRepo userRepo,
            CourseRepo courseRepo,
            CertificateRepo certificateRepo,
            DiplomeRepo diplomeRepo,
            CertificateService certificateService,
            CourseService courseService,
            SpecializationService specializationService,
            DiplomeService diplomeService,
            UserService userService,
            JoinRequestService joinRequestService,
            IssueService issueService
    ) {
        this.userRepo = userRepo;
        this.courseRepo = courseRepo;
        this.certificateRepo = certificateRepo;
        this.diplomeRepo = diplomeRepo;
        this.certificateService = certificateService;
        this.courseService = courseService;
        this.specializationService = specializationService;
        this.diplomeService = diplomeService;
        this.userService = userService;
        this.joinRequestService = joinRequestService;
        this.issueService = issueService;
    }

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        return new AdminStatsResponse(
                userRepo.countByRole(UserRole.USER),
                courseRepo.count(),
                certificateRepo.count(),
                diplomeRepo.count()
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

    @GetMapping("/diplomas")
    public List<AdminDiplomaResponse> getDiplomas() {
        return diplomeService.getAllAdmin();
    }

    @PostMapping("/diplomas")
    public AdminDiplomaResponse createDiploma(@Valid @RequestBody AdminDiplomaRequest request) {
        return diplomeService.createAdmin(request);
    }

    @PutMapping("/diplomas/{diplomaId}")
    public AdminDiplomaResponse updateDiploma(
            @PathVariable Long diplomaId,
            @Valid @RequestBody AdminDiplomaRequest request
    ) {
        return diplomeService.updateAdmin(diplomaId, request);
    }

    @DeleteMapping("/diplomas/{diplomaId}")
    public void deleteDiploma(@PathVariable Long diplomaId) {
        diplomeService.deleteAdmin(diplomaId);
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

    @PostMapping("/uploads/image")
    public UploadResponse uploadImage(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Image file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(BAD_REQUEST, "Only image files are allowed");
        }

        try {
            Path uploadsDir = Paths.get("uploads");
            Files.createDirectories(uploadsDir);

            String originalName = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
            String safeName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
            String storedName = UUID.randomUUID() + "_" + safeName;
            Path target = uploadsDir.resolve(storedName);

            file.transferTo(target);
            return new UploadResponse("/uploads/" + storedName);
        } catch (IOException ex) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Failed to store uploaded image");
        }
    }

    public record AdminStatsResponse(long totalStudents, long totalCourses, long totalCertificates, long totalDiplomas) {}
    public record UploadResponse(String url) {}

    @GetMapping("/users")
    public List<UserResponse> getUsers() {
        return userService.getAll();
    }

    @PutMapping("/users/{userId}/role")
    public UserResponse changeUserRole(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long userId,
            @Valid @RequestBody AdminUserRoleRequest request
    ) {
        return userService.changeRole(requireUserId(principal), userId, request.role());
    }

    @PostMapping("/users/{userId}/toggle-status")
    public UserResponse toggleUserStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long userId
    ) {
        return userService.toggleActiveBanned(requireUserId(principal), userId);
    }

    @DeleteMapping("/users/{userId}")
    public void deleteUserAdmin(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long userId
    ) {
        userService.deleteAdminManaged(requireUserId(principal), userId);
    }

    @GetMapping("/join-requests")
    public List<AdminJoinRequestResponse> getJoinRequests() {
        return joinRequestService.getAllAdmin();
    }

    @PostMapping("/join-requests/{requestId}/accept")
    public AdminJoinRequestResponse acceptJoinRequest(@PathVariable Long requestId) {
        return joinRequestService.accept(requestId);
    }

    @PostMapping("/join-requests/{requestId}/reject")
    public AdminJoinRequestResponse rejectJoinRequest(@PathVariable Long requestId) {
        return joinRequestService.reject(requestId);
    }

    @GetMapping("/issue/students/search")
    public List<IssueStudentSearchResponse> searchIssueStudents(@RequestParam("q") String q) {
        return issueService.searchStudents(q);
    }

    @GetMapping("/issue/students/{userId}/context")
    public IssueStudentContextResponse getIssueStudentContext(@PathVariable Long userId) {
        return issueService.getStudentContext(userId);
    }

    @PostMapping("/issue/generate")
    public IssueGenerateResponse generateIssue(@Valid @RequestBody IssueGenerateRequest request) {
        return issueService.generate(request);
    }

    private Long requireUserId(UserPrincipal principal) {
        if (principal == null || principal.getUser() == null || principal.getUser().getUserId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Unauthorized user context");
        }
        return principal.getUser().getUserId();
    }
}
