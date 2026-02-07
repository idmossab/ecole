package com.example._blog.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example._blog.Dto.CertificateClaimResponse;
import com.example._blog.Dto.CertificateProgressResponse;
import com.example._blog.Dto.MyCertificateProgressResponse;
import com.example._blog.Security.UserPrincipal;
import com.example._blog.Service.CertificateProgressService;

@RestController
@RequestMapping("/api")
public class CertificateProgressCont {
    private final CertificateProgressService certificateProgressService;

    public CertificateProgressCont(CertificateProgressService certificateProgressService) {
        this.certificateProgressService = certificateProgressService;
    }

    @GetMapping("/certificates/{certificateId}/progress")
    public ResponseEntity<CertificateProgressResponse> getCertificateProgress(
            @PathVariable Long certificateId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = principal.getUser().getUserId();
        return ResponseEntity.ok(certificateProgressService.getProgress(userId, certificateId));
    }

    @PostMapping("/videos/{videoId}/watched")
    public ResponseEntity<CertificateProgressResponse> markVideoWatched(
            @PathVariable Long videoId,
            @RequestBody(required = false) MarkWatchedRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = principal.getUser().getUserId();
        boolean watched = request == null || request.watched() == null || request.watched();
        return ResponseEntity.ok(certificateProgressService.markVideoWatched(userId, videoId, watched));
    }

    @PostMapping("/certificates/{certificateId}/claim")
    public ResponseEntity<CertificateClaimResponse> claimCertificate(
            @PathVariable Long certificateId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = principal.getUser().getUserId();
        return ResponseEntity.ok(certificateProgressService.claimCertificate(userId, certificateId));
    }

    @GetMapping("/certificates/my-progress")
    public ResponseEntity<List<MyCertificateProgressResponse>> getMyCertificatesProgress(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = principal.getUser().getUserId();
        return ResponseEntity.ok(certificateProgressService.getMyCertificatesProgress(userId));
    }

    public record MarkWatchedRequest(Boolean watched) {}
}

