package com.example._blog.Dto.admin;

import java.time.LocalDate;

public record IssueRecentResponse(
        Long id,
        String title,
        String studentName,
        String serialNumber,
        LocalDate issueDate,
        String type
) {}
