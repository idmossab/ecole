package com.example._blog.Dto.admin;

import com.example._blog.Entity.enums.DiplomasMode;

public record AdminDiplomaResponse(
        Long id,
        String title,
        DiplomasMode mode,
        long requiredCount
) {}
