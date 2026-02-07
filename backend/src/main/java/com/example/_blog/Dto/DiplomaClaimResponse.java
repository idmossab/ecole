package com.example._blog.Dto;

import java.time.Instant;

public record DiplomaClaimResponse(
        Long diplomaId,
        String message,
        Instant claimedAt,
        String serialNumber
) {}

