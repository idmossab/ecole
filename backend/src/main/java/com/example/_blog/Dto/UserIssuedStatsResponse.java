package com.example._blog.Dto;

import java.time.LocalDate;

public record UserIssuedStatsResponse(
        long issuedCertificates,
        long issuedDiplomas,
        LocalDate lastIssueDate
) {}
