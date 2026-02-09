package com.example._blog.Dto;

public record SpecializationResponse(
        Long id,
        String title,
        String description,
        String programOverview,
        String durationText,
        String certificateAwarded,
        String entryRequirements,
        String programFeatures,
        Long diplomaId
) {}
