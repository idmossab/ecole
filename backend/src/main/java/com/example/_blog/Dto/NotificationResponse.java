package com.example._blog.Dto;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        String type,
        boolean isRead,
        Instant createdAt
) {}

