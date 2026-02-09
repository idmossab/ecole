package com.example._blog.Service;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.admin.AdminCourseRequest;
import com.example._blog.Dto.admin.AdminCourseResponse;
import com.example._blog.Entity.Certificate;
import com.example._blog.Entity.Course;
import com.example._blog.Entity.enums.CourseMode;
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

    public AdminCourseResponse create(Long certificateId, AdminCourseRequest request) {
        Certificate cert = certificateRepo.findById(certificateId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Certificate not found"));

        String title = request.title().trim();
        if (courseRepo.existsByCertificateIdAndTitleIgnoreCase(certificateId, title)) {
            throw new ResponseStatusException(CONFLICT, "Course title already exists for this certificate");
        }

        Course course = Course.builder()
                .title(title)
                .description(request.description())
                .imageUrl(request.imageUrl())
                .mode(parseMode(request.mode()))
                .teacherName(request.teacherName())
                .teacherBio(request.teacherBio())
                .durationText(request.durationText())
                .phoneContact(request.phoneContact())
                .published(request.isPublished() == null ? true : request.isPublished())
                .certificate(cert)
                .build();
        return toResponse(courseRepo.save(course));
    }

    public List<Course> getAllPublic() {
        return courseRepo.findAll();
    }

    public Course getById(Long courseId) {
        return courseRepo.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Course not found"));
    }

    public List<Course> getByCertificatePublic(Long certificateId) {
        return courseRepo.findByCertificateIdOrderByCreatedAtDesc(certificateId);
    }

    public List<AdminCourseResponse> getByCertificateAdmin(Long certificateId) {
        if (!certificateRepo.existsById(certificateId)) {
            throw new ResponseStatusException(NOT_FOUND, "Certificate not found");
        }
        return courseRepo.findByCertificateIdOrderByCreatedAtDesc(certificateId).stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminCourseResponse update(Long courseId, AdminCourseRequest request) {
        Course course = getById(courseId);
        String title = request.title().trim();
        if (courseRepo.existsByCertificateIdAndTitleIgnoreCaseAndIdNot(course.getCertificateId(), title, courseId)) {
            throw new ResponseStatusException(CONFLICT, "Course title already exists for this certificate");
        }
        course.setTitle(title);
        course.setDescription(request.description());
        course.setImageUrl(request.imageUrl());
        course.setMode(parseMode(request.mode()));
        course.setTeacherName(request.teacherName());
        course.setTeacherBio(request.teacherBio());
        course.setDurationText(request.durationText());
        course.setPhoneContact(request.phoneContact());
        course.setPublished(request.isPublished() == null ? course.isPublished() : request.isPublished());
        return toResponse(courseRepo.save(course));
    }

    public void delete(Long courseId) {
        Course course = getById(courseId);
        courseRepo.delete(course);
    }

    private AdminCourseResponse toResponse(Course course) {
        return new AdminCourseResponse(
                course.getId(),
                course.getCertificateId(),
                course.getTitle(),
                course.getDescription(),
                course.getImageUrl(),
                course.getMode(),
                course.getTeacherName(),
                course.getTeacherBio(),
                course.getDurationText(),
                course.getPhoneContact(),
                course.isPublished(),
                course.getCreatedAt(),
                course.getUpdatedAt()
        );
    }

    private CourseMode parseMode(String modeValue) {
        if (modeValue == null || modeValue.isBlank()) {
            return CourseMode.ONLINE;
        }
        try {
            return CourseMode.valueOf(modeValue.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return CourseMode.ONLINE;
        }
    }
}
