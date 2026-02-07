package com.example._blog.Dto;

import java.time.Instant;
import java.util.List;

public record DiplomaProgressResponse(
        Long diplomaId,
        String title,
        long requiredCount,
        long completedCount,
        int percentage,
        long remainingCertificates,
        boolean isCompleted,
        boolean isClaimed,
        String serialNumber,
        Instant claimedAt,
        List<DiplomaCertificateStatusResponse> requiredCertificates
) {}

