package com.example._blog.Dto;

import jakarta.validation.constraints.NotNull;

public record DiplomaJoinRequestCreateRequest(@NotNull Long specializationId) {}
