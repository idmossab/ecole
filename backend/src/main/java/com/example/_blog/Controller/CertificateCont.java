package com.example._blog.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.example._blog.Entity.Certificate;
import com.example._blog.Entity.Course;
import com.example._blog.Service.CertificateService;
import com.example._blog.Service.CourseService;

@RestController
public class CertificateCont {
    private final CertificateService certificateService;
    private final CourseService courseService;

    public CertificateCont(CertificateService certificateService, CourseService courseService) {
        this.certificateService = certificateService;
        this.courseService = courseService;
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
}
