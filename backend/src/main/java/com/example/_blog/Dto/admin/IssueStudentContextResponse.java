package com.example._blog.Dto.admin;

import java.util.List;

public record IssueStudentContextResponse(
        IssueStudentInfoResponse student,
        List<IssueCertificateOptionResponse> certificates,
        List<IssueDiplomaOptionResponse> diplomas,
        List<IssueRecentResponse> recentlyIssued
) {}
