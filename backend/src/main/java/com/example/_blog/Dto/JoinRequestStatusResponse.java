package com.example._blog.Dto;

import java.time.Instant;

import com.example._blog.Entity.enums.JoinRequestStatus;

public record JoinRequestStatusResponse(
        String requestType,
        JoinRequestStatus status,
        Instant requestedAt
) {}
