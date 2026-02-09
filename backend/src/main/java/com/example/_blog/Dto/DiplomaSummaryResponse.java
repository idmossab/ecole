package com.example._blog.Dto;

import com.example._blog.Entity.enums.DiplomasMode;

public record DiplomaSummaryResponse(
        Long id,
        String title,
        long requiredCount,
        DiplomasMode mode
) {}
