package com.example._blog.Dto;

import java.time.Instant;

public record CertificateClaimResponse(
        Long certificateId,
        String message,
        Instant claimedAt,
        String serialNumber
) {}

