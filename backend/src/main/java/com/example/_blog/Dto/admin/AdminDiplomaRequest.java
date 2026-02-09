package com.example._blog.Dto.admin;

import com.example._blog.Entity.enums.DiplomasMode;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminDiplomaRequest(
        @NotBlank(message = "title is required")
        @Size(max = 255, message = "title must be at most 255 characters")
        String title,
        @NotNull(message = "mode is required")
        DiplomasMode mode
) {}
