package com.example._blog.Dto.admin;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record IssueGenerateRequest(
        @NotNull Long userId,
        @NotNull String type,
        Long certificateId,
        Long diplomaId,
        @NotNull LocalDate issueDate
) {}
