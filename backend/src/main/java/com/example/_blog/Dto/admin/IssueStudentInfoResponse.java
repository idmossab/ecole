package com.example._blog.Dto.admin;

public record IssueStudentInfoResponse(
        Long userId,
        String name,
        String userName,
        String email,
        String phone,
        String city
) {}
