package com.example._blog.Dto.admin;

import java.time.Instant;
import com.example._blog.Entity.enums.CourseMode;

public record AdminCourseResponse(
        Long id,
        Long certificateId,
        String title,
        String description,
        String imageUrl,
        CourseMode mode,
        String teacherName,
        String teacherBio,
        String durationText,
        String phoneContact,
        boolean isPublished,
        Instant createdAt,
        Instant updatedAt
) {}
