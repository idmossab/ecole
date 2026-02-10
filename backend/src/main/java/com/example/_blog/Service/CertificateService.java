package com.example._blog.Service;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.admin.AdminCertificateRequest;
import com.example._blog.Dto.admin.AdminCertificateResponse;
import com.example._blog.Entity.Certificate;
import com.example._blog.Repositories.CertificateRepo;
import com.example._blog.Repositories.CourseRepo;
import com.example._blog.Repositories.JoinRequestRepo;

@Service
public class CertificateService {
    private final CertificateRepo repo;
    private final CourseRepo courseRepo;
    private final JoinRequestRepo joinRequestRepo;

    public CertificateService(CertificateRepo repo, CourseRepo courseRepo, JoinRequestRepo joinRequestRepo) {
        this.repo = repo;
        this.courseRepo = courseRepo;
        this.joinRequestRepo = joinRequestRepo;
    }

    public AdminCertificateResponse create(AdminCertificateRequest request) {
        String title = request.title().trim();
        if (repo.existsByTitleIgnoreCase(title)) {
            throw new ResponseStatusException(CONFLICT, "Certificate title already exists");
        }

        Certificate cert = Certificate.builder()
                .title(title)
                .description(request.description())
                .imageUrl(request.imageUrl())
                .published(request.isPublished() == null ? true : request.isPublished())
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
        cert.setImageUrl(request.imageUrl());
        cert.setPublished(request.isPublished() == null ? cert.isPublished() : request.isPublished());
        return toResponse(repo.save(cert));
    }

    @Transactional
    public void delete(Long id) {
        Certificate cert = getById(id);
        try {
            courseRepo.deleteByCertificateId(id);
            joinRequestRepo.deleteByCertificateId(id);
            repo.deleteUserCertificateLinks(id);
            repo.delete(cert);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(CONFLICT, "Cannot delete certificate: linked records still exist");
        }
    }

    private AdminCertificateResponse toResponse(Certificate certificate) {
        return new AdminCertificateResponse(
                certificate.getId(),
                certificate.getTitle(),
                certificate.getDescription(),
                certificate.getImageUrl(),
                certificate.getCreatedAt(),
                certificate.getUpdatedAt()
        );
    }
}
