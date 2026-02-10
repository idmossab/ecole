package com.example._blog.Dto.admin;

import java.time.Instant;

import com.example._blog.Entity.enums.JoinRequestStatus;

public record AdminJoinRequestResponse(
        Long id,
        Long userId,
        String studentUserName,
        String studentEmail,
        Long certificateId,
        String certificateTitle,
        Long courseId,
        String courseTitle,
        JoinRequestStatus status,
        Instant requestedAt
) {}
