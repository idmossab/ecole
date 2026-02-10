package com.example._blog.Dto.admin;

import jakarta.validation.constraints.NotBlank;

public record AdminUserRoleRequest(@NotBlank String role) {}
