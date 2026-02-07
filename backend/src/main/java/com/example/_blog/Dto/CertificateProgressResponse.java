package com.example._blog.Dto;

public record CertificateProgressResponse(
        Long certificateId,
        long totalVideos,
        long watchedVideos,
        int percentage,
        long remainingVideos,
        boolean isCompleted,
        boolean isClaimed
) {}

