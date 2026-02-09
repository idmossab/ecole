package com.example._blog.Dto.admin;

import java.time.Instant;

public record AdminCertificateResponse(
        Long id,
        String title,
        String description,
        Instant createdAt,
        Instant updatedAt
) {}
