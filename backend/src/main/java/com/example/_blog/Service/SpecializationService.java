package com.example._blog.Service;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.admin.AdminSpecializationRequest;
import com.example._blog.Dto.admin.AdminSpecializationResponse;
import com.example._blog.Entity.Diplome;
import com.example._blog.Entity.Specialization;
import com.example._blog.Repositories.DiplomeRepo;
import com.example._blog.Repositories.SpecializationRepo;

@Service
public class SpecializationService {
    private final SpecializationRepo specializationRepo;
    private final DiplomeRepo diplomeRepo;

    public SpecializationService(SpecializationRepo specializationRepo, DiplomeRepo diplomeRepo) {
        this.specializationRepo = specializationRepo;
        this.diplomeRepo = diplomeRepo;
    }

    public List<AdminSpecializationResponse> getByDiplomaAdmin(Long diplomaId) {
        if (!diplomeRepo.existsById(diplomaId)) {
            throw new ResponseStatusException(NOT_FOUND, "Diploma not found");
        }
        return specializationRepo.findByDiplomaIdOrderByCreatedAtDesc(diplomaId).stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminSpecializationResponse create(Long diplomaId, AdminSpecializationRequest request) {
        Diplome diploma = diplomeRepo.findById(diplomaId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Diploma not found"));

        String title = request.title().trim();
        if (specializationRepo.existsByDiplomaIdAndTitleIgnoreCase(diplomaId, title)) {
            throw new ResponseStatusException(CONFLICT, "Specialization title already exists for this diploma");
        }

        Specialization specialization = Specialization.builder()
                .title(title)
                .description(request.description())
                .programOverview(request.programOverview())
                .durationText(request.durationText())
                .certificateAwarded(request.certificateAwarded())
                .entryRequirements(request.entryRequirements())
                .programFeatures(request.programFeatures())
                .diploma(diploma)
                .build();
        return toResponse(specializationRepo.save(specialization));
    }

    public AdminSpecializationResponse update(Long specializationId, AdminSpecializationRequest request) {
        Specialization specialization = getById(specializationId);
        String title = request.title().trim();
        if (specializationRepo.existsByDiplomaIdAndTitleIgnoreCaseAndIdNot(
                specialization.getDiplomaId(),
                title,
                specializationId
        )) {
            throw new ResponseStatusException(CONFLICT, "Specialization title already exists for this diploma");
        }

        specialization.setTitle(title);
        specialization.setDescription(request.description());
        specialization.setProgramOverview(request.programOverview());
        specialization.setDurationText(request.durationText());
        specialization.setCertificateAwarded(request.certificateAwarded());
        specialization.setEntryRequirements(request.entryRequirements());
        specialization.setProgramFeatures(request.programFeatures());
        return toResponse(specializationRepo.save(specialization));
    }

    public void delete(Long specializationId) {
        Specialization specialization = getById(specializationId);
        specializationRepo.delete(specialization);
    }

    private Specialization getById(Long specializationId) {
        return specializationRepo.findById(specializationId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Specialization not found"));
    }

    private AdminSpecializationResponse toResponse(Specialization specialization) {
        return new AdminSpecializationResponse(
                specialization.getId(),
                specialization.getTitle(),
                specialization.getDescription(),
                specialization.getProgramOverview(),
                specialization.getDurationText(),
                specialization.getCertificateAwarded(),
                specialization.getEntryRequirements(),
                specialization.getProgramFeatures(),
                specialization.getDiplomaId(),
                specialization.getCreatedAt(),
                specialization.getUpdatedAt()
        );
    }
}
