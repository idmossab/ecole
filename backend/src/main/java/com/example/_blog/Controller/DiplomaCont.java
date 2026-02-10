package com.example._blog.Controller;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.DiplomaCertificateStatusResponse;
import com.example._blog.Dto.DiplomaClaimResponse;
import com.example._blog.Dto.DiplomaJoinRequestCreateRequest;
import com.example._blog.Dto.DiplomaProgressResponse;
import com.example._blog.Dto.DiplomaSummaryResponse;
import com.example._blog.Dto.SpecializationResponse;
import com.example._blog.Dto.admin.AdminJoinRequestResponse;
import com.example._blog.Security.UserPrincipal;
import com.example._blog.Service.DiplomeService;
import com.example._blog.Service.JoinRequestService;
import com.example._blog.Service.SpecializationService;

@RestController
public class DiplomaCont {
    private final DiplomeService diplomeService;
    private final SpecializationService specializationService;
    private final JoinRequestService joinRequestService;

    public DiplomaCont(
            DiplomeService diplomeService,
            SpecializationService specializationService,
            JoinRequestService joinRequestService
    ) {
        this.diplomeService = diplomeService;
        this.specializationService = specializationService;
        this.joinRequestService = joinRequestService;
    }

    @GetMapping("/diplomas")
    public List<DiplomaSummaryResponse> getDiplomas() {
        return diplomeService.getAllDiplomas();
    }

    @GetMapping("/diplomas/{diplomaId}")
    public DiplomaSummaryResponse getDiplomaById(@PathVariable Long diplomaId) {
        return diplomeService.getDiplomaById(diplomaId);
    }

    @GetMapping("/diplomas/{diplomaId}/certificates")
    public List<DiplomaCertificateStatusResponse> getDiplomaCertificates(@PathVariable Long diplomaId) {
        return diplomeService.getDiplomaCertificates(diplomaId);
    }

    @GetMapping("/diplomas/{diplomaId}/specializations")
    public List<SpecializationResponse> getDiplomaSpecializations(@PathVariable Long diplomaId) {
        return specializationService.getByDiplomaPublic(diplomaId);
    }

    @GetMapping("/api/diplomas/progress")
    public List<DiplomaProgressResponse> getMyDiplomasProgress(@AuthenticationPrincipal UserPrincipal principal) {
        return diplomeService.getAllProgress(requireUserId(principal));
    }

    @GetMapping("/api/diplomas/{diplomaId}/progress")
    public DiplomaProgressResponse getDiplomaProgress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long diplomaId
    ) {
        return diplomeService.getProgress(requireUserId(principal), diplomaId);
    }

    @PostMapping("/api/diplomas/{diplomaId}/claim")
    public DiplomaClaimResponse claimDiploma(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long diplomaId
    ) {
        return diplomeService.claim(requireUserId(principal), diplomaId);
    }

    @PostMapping("/api/diplomas/{diplomaId}/join-requests")
    public AdminJoinRequestResponse createDiplomaJoinRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long diplomaId,
            @org.springframework.web.bind.annotation.RequestBody DiplomaJoinRequestCreateRequest request
    ) {
        return joinRequestService.createDiploma(requireUserId(principal), diplomaId, request);
    }

    private Long requireUserId(UserPrincipal principal) {
        if (principal == null || principal.getUser() == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Unauthorized");
        }
        return principal.getUser().getUserId();
    }
}
