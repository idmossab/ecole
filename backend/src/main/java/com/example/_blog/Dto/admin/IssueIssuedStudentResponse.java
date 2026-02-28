package com.example._blog.Dto.admin;

import java.time.LocalDate;

public record IssueIssuedStudentResponse(
        Long userId,
        String name,
        String userName,
        String email,
        String status,
        long issuedCertificates,
        long issuedDiplomas,
        Long latestIssuedId,
        LocalDate lastIssueDate
) {}
