package com.example._blog.Service;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Entity.Course;
import com.example._blog.Entity.Media;
import com.example._blog.Entity.enums.MediaType;
import com.example._blog.Repositories.CourseRepo;
import com.example._blog.Repositories.MediaRepo;

@Service
public class MediaService {
    private static final Path UPLOAD_DIR = Paths.get("uploads");

    private final MediaRepo mediaRepo;
    private final CourseRepo courseRepo;

    public MediaService(MediaRepo mediaRepo, CourseRepo courseRepo) {
        this.mediaRepo = mediaRepo;
        this.courseRepo = courseRepo;
    }

    public List<Media> uploadCourseVideos(Long courseId, List<MultipartFile> files) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Course not found"));

        ensureUploadDir();
        List<Media> saved = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            String filename = UUID.randomUUID() + "-" + sanitizeFilename(file.getOriginalFilename());
            Path target = UPLOAD_DIR.resolve(filename);
            try {
                Files.copy(file.getInputStream(), target);
            } catch (IOException ex) {
                throw new ResponseStatusException(BAD_REQUEST, "Failed to store media");
            }
            Media media = Media.builder()
                    .course(course)
                    .url("/uploads/" + filename)
                    .type(MediaType.VIDEO)
                    .build();
            saved.add(mediaRepo.save(media));
        }
        return saved;
    }

    private void ensureUploadDir() {
        try {
            if (!Files.exists(UPLOAD_DIR)) {
                Files.createDirectories(UPLOAD_DIR);
            }
        } catch (IOException ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Failed to create upload directory");
        }
    }

    private String sanitizeFilename(String name) {
        if (name == null || name.isBlank()) return "file";
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
