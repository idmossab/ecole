package com.example._blog.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example._blog.Entity.Certificate;
import com.example._blog.Entity.Course;
import com.example._blog.Service.CertificateService;
import com.example._blog.Service.CourseService;

@RestController
@RequestMapping("/certificates")
public class CertificateCont {
    private final CertificateService certificateService;
    private final CourseService courseService;

    public CertificateCont(CertificateService certificateService, CourseService courseService) {
        this.certificateService = certificateService;
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<List<Certificate>> getAll() {
        return ResponseEntity.ok(certificateService.getAllPublic());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Certificate> getById(@PathVariable Long id) {
        return ResponseEntity.ok(certificateService.getById(id));
    }

    @GetMapping("/{id}/courses")
    public ResponseEntity<List<Course>> getCourses(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getByCertificatePublic(id));
    }
}
