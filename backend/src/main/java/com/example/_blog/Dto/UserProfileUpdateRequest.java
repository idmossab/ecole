package com.example._blog.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserProfileUpdateRequest(
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @NotBlank @Size(max = 100) String userName,
        @NotBlank @Email @Size(max = 255) String email,
        @Size(max = 255) String city,
        @Size(max = 50) String phone
) {}
