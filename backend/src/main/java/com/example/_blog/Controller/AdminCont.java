package com.example._blog.Controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example._blog.Entity.Certificate;
import com.example._blog.Entity.Course;
import com.example._blog.Entity.Media;
import com.example._blog.Service.CertificateService;
import com.example._blog.Service.CourseService;
import com.example._blog.Service.MediaService;

@RestController
@RequestMapping("/admin")
public class AdminCont {
    private final CertificateService certificateService;
    private final CourseService courseService;
    private final MediaService mediaService;

    public AdminCont(
            CertificateService certificateService,
            CourseService courseService,
            MediaService mediaService
    ) {
        this.certificateService = certificateService;
        this.courseService = courseService;
        this.mediaService = mediaService;
    }

    @GetMapping("/certificates")
    public ResponseEntity<List<Certificate>> getCertificates() {
        return ResponseEntity.ok(certificateService.getAll());
    }

    @PostMapping("/certificates")
    public ResponseEntity<Certificate> createCertificate(@RequestBody CertificateCreateRequest req) {
        return ResponseEntity.ok(certificateService.create(req.title(), req.description()));
    }

    @PostMapping("/courses")
    public ResponseEntity<Course> createCourse(@RequestBody CourseCreateRequest req) {
        return ResponseEntity.ok(courseService.create(
                req.certificateId(),
                req.title(),
                req.content(),
                req.whatYouWillLearn()
        ));
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
    public record CourseCreateRequest(Long certificateId, String title, String content, String whatYouWillLearn) {}
}
