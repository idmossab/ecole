package com.example._blog.Dto;

public record MyCertificateProgressResponse(
        Long certificateId,
        String title,
        long totalVideos,
        long watchedVideos,
        int percentage,
        long remainingVideos,
        boolean isCompleted,
        boolean isClaimed,
        String status,
        Long firstCourseId
) {}

