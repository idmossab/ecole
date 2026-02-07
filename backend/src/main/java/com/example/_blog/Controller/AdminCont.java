package com.example._blog.Controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example._blog.Entity.Certificate;
import com.example._blog.Entity.Course;
import com.example._blog.Entity.Diplome;
import com.example._blog.Entity.Media;
import com.example._blog.Entity.enums.UserRole;
import com.example._blog.Repositories.CertificateRepo;
import com.example._blog.Repositories.CourseRepo;
import com.example._blog.Repositories.DiplomeRepo;
import com.example._blog.Repositories.UserRepo;
import com.example._blog.Service.CertificateService;
import com.example._blog.Service.CourseService;
import com.example._blog.Service.DiplomeService;
import com.example._blog.Service.MediaService;
import com.example._blog.Service.NotificationService;

@RestController
@RequestMapping("/admin")
public class AdminCont {
    private final CertificateService certificateService;
    private final CourseService courseService;
    private final MediaService mediaService;
    private final DiplomeService diplomeService;
    private final NotificationService notificationService;
    private final CertificateRepo certificateRepo;
    private final CourseRepo courseRepo;
    private final DiplomeRepo diplomeRepo;
    private final UserRepo userRepo;

    public AdminCont(
            CertificateService certificateService,
            CourseService courseService,
            MediaService mediaService,
            DiplomeService diplomeService,
            NotificationService notificationService,
            CertificateRepo certificateRepo,
            CourseRepo courseRepo,
            DiplomeRepo diplomeRepo,
            UserRepo userRepo
    ) {
        this.certificateService = certificateService;
        this.courseService = courseService;
        this.mediaService = mediaService;
        this.diplomeService = diplomeService;
        this.notificationService = notificationService;
        this.certificateRepo = certificateRepo;
        this.courseRepo = courseRepo;
        this.diplomeRepo = diplomeRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        long totalStudents = userRepo.countByRole(UserRole.USER);
        long totalCourses = courseRepo.count();
        long totalCertificates = certificateRepo.count();
        long totalDiplomas = diplomeRepo.count();
        return ResponseEntity.ok(new AdminStatsResponse(
                totalStudents,
                totalCourses,
                totalCertificates,
                totalDiplomas
        ));
    }

    @GetMapping("/certificates")
    public ResponseEntity<List<Certificate>> getCertificates() {
        return ResponseEntity.ok(certificateService.getAll());
    }

    @GetMapping("/diplomas")
    public ResponseEntity<List<com.example._blog.Dto.DiplomaSummaryResponse>> getDiplomas() {
        return ResponseEntity.ok(diplomeService.getAllDiplomas());
    }

    @PostMapping("/certificates")
    public ResponseEntity<Certificate> createCertificate(@RequestBody CertificateCreateRequest req) {
        Certificate created = certificateService.create(req.title(), req.description());
        notificationService.notifyRole(
                UserRole.USER,
                "New Certificate Available",
                "A new certificate was added: " + created.getTitle(),
                "NEW_CERTIFICATE"
        );
        return ResponseEntity.ok(created);
    }

    @PostMapping("/diplomas")
    public ResponseEntity<Diplome> createDiploma(@RequestBody DiplomaCreateRequest req) {
        Diplome created = diplomeService.createDiploma(req.title(), req.certificateIds());
        notificationService.notifyRole(
                UserRole.USER,
                "New Diploma Available",
                "A new diploma was added: " + created.getLabel(),
                "NEW_DIPLOMA"
        );
        return ResponseEntity.ok(created);
    }

    @PostMapping("/courses")
    public ResponseEntity<Course> createCourse(@RequestBody CourseCreateRequest req) {
        Course created = courseService.create(
                req.certificateId(),
                req.title(),
                req.content(),
                req.whatYouWillLearn()
        );
        notificationService.notifyRole(
                UserRole.USER,
                "New Course Available",
                "A new course was added: " + created.getTitle(),
                "NEW_COURSE"
        );
        return ResponseEntity.ok(created);
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getCourses(@RequestParam(required = false) Long certificateId) {
        if (certificateId == null) {
            return ResponseEntity.ok(courseService.getAll());
        }
        return ResponseEntity.ok(courseService.getByCertificate(certificateId));
    }

    @PostMapping(value = "/courses/{courseId}/videos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<Media>> uploadVideos(
            @PathVariable Long courseId,
            @RequestParam(name = "files") List<MultipartFile> files
    ) {
        return ResponseEntity.ok(mediaService.uploadCourseVideos(courseId, files));
    }

    public record CertificateCreateRequest(String title, String description) {}
    public record DiplomaCreateRequest(String title, List<Long> certificateIds) {}
    public record CourseCreateRequest(Long certificateId, String title, String content, String whatYouWillLearn) {}
    public record AdminStatsResponse(long totalStudents, long totalCourses, long totalCertificates, long totalDiplomas) {}
}
