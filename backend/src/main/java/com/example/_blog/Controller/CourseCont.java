package com.example._blog.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example._blog.Entity.Course;
import com.example._blog.Service.CourseService;

@RestController
@RequestMapping("/courses")
public class CourseCont {
    private final CourseService courseService;

    public CourseCont(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<Course> getCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getById(courseId));
    }
}
