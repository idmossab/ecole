package com.example._blog.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example._blog.Entity.Course;
import com.example._blog.Entity.Media;
import com.example._blog.Service.CourseService;
import com.example._blog.Service.MediaService;

@RestController
@RequestMapping("/courses")
public class CourseCont {
    private final MediaService mediaService;
    private final CourseService courseService;

    public CourseCont(MediaService mediaService, CourseService courseService) {
        this.mediaService = mediaService;
        this.courseService = courseService;
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<Course> getCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getById(courseId));
    }

    @GetMapping("/{courseId}/media")
    public ResponseEntity<List<Media>> getCourseMedia(@PathVariable Long courseId) {
        return ResponseEntity.ok(mediaService.getCourseVideos(courseId));
    }
}
