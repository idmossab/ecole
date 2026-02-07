package com.example._blog.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example._blog.Dto.DiplomaCertificateStatusResponse;
import com.example._blog.Dto.DiplomaSummaryResponse;
import com.example._blog.Service.DiplomeService;

@RestController
@RequestMapping("/diplomas")
public class DiplomeCont {
    private final DiplomeService diplomeService;

    public DiplomeCont(DiplomeService diplomeService) {
        this.diplomeService = diplomeService;
    }

    @GetMapping
    public ResponseEntity<List<DiplomaSummaryResponse>> getAll() {
        return ResponseEntity.ok(diplomeService.getAllDiplomas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiplomaSummaryResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(diplomeService.getDiplomaById(id));
    }

    @GetMapping("/{id}/certificates")
    public ResponseEntity<List<DiplomaCertificateStatusResponse>> getRequiredCertificates(@PathVariable Long id) {
        return ResponseEntity.ok(diplomeService.getDiplomaCertificates(id));
    }
}
