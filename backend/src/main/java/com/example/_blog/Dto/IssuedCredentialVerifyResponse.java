package com.example._blog.Dto;

import java.time.LocalDate;

public record IssuedCredentialVerifyResponse(
        String serialNumber,
        String type,
        String title,
        LocalDate issueDate,
        Long userId,
        String fullName,
        String userName,
        String email,
        String phone,
        String city
) {}
