package com.example._blog.Dto.admin;

public record IssueStatsResponse(
        long activeCertificates,
        long activeDiplomas,
        long issuedDiplomas,
        long issuedCertificates
) {}
