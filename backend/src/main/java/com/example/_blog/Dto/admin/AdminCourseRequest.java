package com.example._blog.Dto.admin;

import com.example._blog.Entity.enums.CourseMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminCourseRequest(
        @NotBlank(message = "title is required")
        @Size(max = 255, message = "title must be at most 255 characters")
        String title,
        String description,
        String imageUrl,
        CourseMode mode,
        String teacherName,
        String teacherBio,
        String durationText,
        String phoneContact,
        Boolean isPublished
) {}
