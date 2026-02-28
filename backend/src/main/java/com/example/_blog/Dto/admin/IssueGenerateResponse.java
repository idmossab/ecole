package com.example._blog.Dto.admin;

import java.time.LocalDate;

public record IssueGenerateResponse(
        Long issuedId,
        String serialNumber,
        LocalDate issueDate,
        String qrPreview,
        String qrImageUrl,
        String documentUrl
) {}
