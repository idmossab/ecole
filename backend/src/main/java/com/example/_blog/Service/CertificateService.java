package com.example._blog.Service;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.admin.AdminCertificateRequest;
import com.example._blog.Dto.admin.AdminCertificateResponse;
import com.example._blog.Entity.Certificate;
import com.example._blog.Repositories.CertificateRepo;

@Service
public class CertificateService {
    private final CertificateRepo repo;

    public CertificateService(CertificateRepo repo) {
        this.repo = repo;
    }

    public AdminCertificateResponse create(AdminCertificateRequest request) {
        String title = request.title().trim();
        if (repo.existsByTitleIgnoreCase(title)) {
            throw new ResponseStatusException(CONFLICT, "Certificate title already exists");
        }

        Certificate cert = Certificate.builder()
                .title(title)
                .description(request.description())
                .isPublished(request.isPublished() == null ? true : request.isPublished())
                .build();
        return toResponse(repo.save(cert));
    }

    public List<AdminCertificateResponse> getAllAdmin() {
        return repo.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    public Certificate getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Certificate not found"));
    }

    public List<Certificate> getAllPublic() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    public AdminCertificateResponse update(Long id, AdminCertificateRequest request) {
        Certificate cert = getById(id);
        String title = request.title().trim();
        if (repo.existsByTitleIgnoreCaseAndIdNot(title, id)) {
            throw new ResponseStatusException(CONFLICT, "Certificate title already exists");
        }
        cert.setTitle(title);
        cert.setDescription(request.description());
        cert.setPublished(request.isPublished() == null ? cert.isPublished() : request.isPublished());
        return toResponse(repo.save(cert));
    }

    public void delete(Long id) {
        Certificate cert = getById(id);
        repo.delete(cert);
    }

    private AdminCertificateResponse toResponse(Certificate certificate) {
        return new AdminCertificateResponse(
                certificate.getId(),
                certificate.getTitle(),
                certificate.getDescription(),
                certificate.isPublished(),
                certificate.getCreatedAt(),
                certificate.getUpdatedAt()
        );
    }
}
