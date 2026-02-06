package com.example._blog.Service;

import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Entity.Certificate;
import com.example._blog.Entity.Course;
import com.example._blog.Repositories.CertificateRepo;
import com.example._blog.Repositories.CourseRepo;

@Service
public class CourseService {
    private final CourseRepo courseRepo;
    private final CertificateRepo certificateRepo;

    public CourseService(CourseRepo courseRepo, CertificateRepo certificateRepo) {
        this.courseRepo = courseRepo;
        this.certificateRepo = certificateRepo;
    }

    public Course create(Long certificateId, String title, String content) {
        Certificate cert = certificateRepo.findById(certificateId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Certificate not found"));
        Course course = Course.builder()
                .title(title)
                .content(content == null ? "" : content)
                .certificate(cert)
                .build();
        return courseRepo.save(course);
    }

    public List<Course> getAll() {
        return courseRepo.findAll();
    }

    public List<Course> getByCertificate(Long certificateId) {
        return courseRepo.findByCertificateId(certificateId);
    }
}
