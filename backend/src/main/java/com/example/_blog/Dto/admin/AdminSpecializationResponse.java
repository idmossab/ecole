package com.example._blog.Dto.admin;

import java.time.Instant;

public record AdminSpecializationResponse(
        Long id,
        String title,
        String description,
        String programOverview,
        String durationText,
        String certificateAwarded,
        String entryRequirements,
        String programFeatures,
        Long diplomaId,
        Instant createdAt,
        Instant updatedAt
) {}
