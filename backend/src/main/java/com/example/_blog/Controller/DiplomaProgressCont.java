package com.example._blog.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example._blog.Dto.DiplomaClaimResponse;
import com.example._blog.Dto.DiplomaProgressResponse;
import com.example._blog.Security.UserPrincipal;
import com.example._blog.Service.DiplomeService;

@RestController
@RequestMapping("/api/diplomas")
public class DiplomaProgressCont {
    private final DiplomeService diplomeService;

    public DiplomaProgressCont(DiplomeService diplomeService) {
        this.diplomeService = diplomeService;
    }

    @GetMapping("/progress")
    public ResponseEntity<List<DiplomaProgressResponse>> getAllProgress(@AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal.getUser().getUserId();
        return ResponseEntity.ok(diplomeService.getAllProgress(userId));
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<DiplomaProgressResponse> getProgress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = principal.getUser().getUserId();
        return ResponseEntity.ok(diplomeService.getProgress(userId, id));
    }

    @PostMapping("/{id}/claim")
    public ResponseEntity<DiplomaClaimResponse> claim(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = principal.getUser().getUserId();
        return ResponseEntity.ok(diplomeService.claim(userId, id));
    }
}

