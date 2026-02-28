package com.example._blog.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.example._blog.Dto.IssuedCredentialVerifyResponse;
import com.example._blog.Service.IssueService;

@RestController
@RequestMapping("/api/issued")
public class IssuedCredentialCont {
    private final IssueService issueService;

    public IssuedCredentialCont(IssueService issueService) {
        this.issueService = issueService;
    }

    @GetMapping("/verify/{serialNumber}")
    public IssuedCredentialVerifyResponse verifyBySerial(@PathVariable String serialNumber) {
        return issueService.verifyBySerial(serialNumber);
    }

    @GetMapping(value = "/qr/{serialNumber}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> qrBySerial(@PathVariable String serialNumber) {
        byte[] image = issueService.getQrImageBySerial(serialNumber);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(image);
    }
}
