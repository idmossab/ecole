package com.example._blog.Dto.admin;

import java.util.List;

public record IssueCertificateOptionResponse(
        Long certificateId,
        String title,
        boolean accepted,
        boolean completed,
        boolean eligible,
        boolean alreadyIssued,
        List<String> courses
) {}
