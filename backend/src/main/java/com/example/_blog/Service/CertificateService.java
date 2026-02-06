package com.example._blog.Service;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Entity.Certificate;
import com.example._blog.Repositories.CertificateRepo;

@Service
public class CertificateService {
    private final CertificateRepo repo;

    public CertificateService(CertificateRepo repo) {
        this.repo = repo;
    }

    public Certificate create(String title, String description) {
        if (repo.existsByTitle(title)) {
            throw new ResponseStatusException(CONFLICT, "Certificate title already exists");
        }
        Certificate cert = Certificate.builder()
                .title(title)
                .description(description)
                .build();
        return repo.save(cert);
    }

    public List<Certificate> getAll() {
        return repo.findAll();
    }

    public Certificate getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Certificate not found"));
    }
}
