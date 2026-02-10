package com.example._blog.Dto.admin;

import java.util.List;

public record IssueDiplomaOptionResponse(
        Long diplomaId,
        String title,
        boolean accepted,
        boolean completed,
        boolean eligible,
        boolean alreadyIssued,
        List<String> specializations,
        List<String> summaryCourses
) {}
