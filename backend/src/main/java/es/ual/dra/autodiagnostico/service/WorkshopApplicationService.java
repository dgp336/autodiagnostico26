package es.ual.dra.autodiagnostico.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;

import es.ual.dra.autodiagnostico.dto.WorkshopApplicationRequestDTO;
import es.ual.dra.autodiagnostico.dto.WorkshopApplicationResponseDTO;
import es.ual.dra.autodiagnostico.model.entitity.core.Issue;
import es.ual.dra.autodiagnostico.model.entitity.core.Workshop;
import es.ual.dra.autodiagnostico.model.entitity.core.WorkshopApplication;
import es.ual.dra.autodiagnostico.model.entitity.core.WorkshopApplicationStatus;
import es.ual.dra.autodiagnostico.model.entitity.user.AppUser;
import es.ual.dra.autodiagnostico.model.entitity.user.UserRole;
import es.ual.dra.autodiagnostico.repository.IssueRepository;
import es.ual.dra.autodiagnostico.repository.UserRepository;
import es.ual.dra.autodiagnostico.repository.WorkshopApplicationRepository;
import es.ual.dra.autodiagnostico.repository.WorkshopRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkshopApplicationService {

    private final WorkshopApplicationRepository applicationRepository;
    private final WorkshopRepository workshopRepository;
    private final UserRepository userRepository;
    private final IssueRepository issueRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public WorkshopApplicationResponseDTO submit(WorkshopApplicationRequestDTO request) {
        String applicantEmail = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmailIgnoreCase(applicantEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo");
        }
        if (applicationRepository.existsByApplicantEmailIgnoreCaseAndStatus(applicantEmail, WorkshopApplicationStatus.PENDING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una solicitud pendiente con ese correo");
        }

        WorkshopApplication application = WorkshopApplication.builder()
                .applicantFullName(request.getFullName().trim())
                .applicantEmail(applicantEmail)
            .passwordHash(passwordEncoder.encode(request.getPassword()))
                .workshopName(request.getWorkshopName().trim())
                .address(request.getAddress().trim())
                .phone(request.getPhone().trim())
                .email(normalizeEmail(request.getEmail()))
                .schedule(request.getSchedule().trim())
                .photoUrl(defaultPhoto(request.getPhotoUrl()))
                .vehicleLimit(request.getVehicleLimit())
                .status(WorkshopApplicationStatus.PENDING)
                .build();

        return toDto(applicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public List<WorkshopApplicationResponseDTO> listPending() {
        return applicationRepository.findByStatusOrderByCreatedAtDesc(WorkshopApplicationStatus.PENDING)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public WorkshopApplicationResponseDTO approve(Long applicationId) {
        WorkshopApplication application = getApplication(applicationId);
        if (application.getStatus() != WorkshopApplicationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La solicitud ya fue procesada");
        }

        if (userRepository.existsByEmailIgnoreCase(application.getApplicantEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo");
        }
        if (workshopRepository.findByNameIgnoreCase(application.getWorkshopName()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un taller con ese nombre");
        }

        AppUser mechanic = new AppUser();
        mechanic.setFullName(application.getApplicantFullName());
        mechanic.setEmail(application.getApplicantEmail());
        mechanic.setPasswordHash(application.getPasswordHash());
        mechanic.setRole(UserRole.TALLER);
        mechanic.setAvatarUrl(buildAvatarUrl(application.getApplicantFullName(), UserRole.TALLER));
        mechanic.setCreatedAt(LocalDateTime.now());
        mechanic = userRepository.save(mechanic);

        Workshop workshop = Workshop.builder()
                .name(application.getWorkshopName())
                .address(application.getAddress())
                .phone(application.getPhone())
                .email(application.getEmail())
                .schedule(application.getSchedule())
                .photoUrl(defaultPhoto(application.getPhotoUrl()))
                .vehicleLimit(application.getVehicleLimit())
                .mechanicId(mechanic.getId())
                .latitude(36.8381)
                .longitude(-2.4597)
                .build();
        workshop = workshopRepository.save(workshop);

        application.setStatus(WorkshopApplicationStatus.APPROVED);
        application.setApprovedMechanic(mechanic);
        application.setApprovedWorkshop(workshop);
        application.setReviewedAt(LocalDateTime.now());
        return toDto(applicationRepository.save(application));
    }

    @Transactional
    public WorkshopApplicationResponseDTO reject(Long applicationId) {
        WorkshopApplication application = getApplication(applicationId);
        if (application.getStatus() != WorkshopApplicationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La solicitud ya fue procesada");
        }

        application.setStatus(WorkshopApplicationStatus.REJECTED);
        application.setReviewedAt(LocalDateTime.now());
        return toDto(applicationRepository.save(application));
    }

    @Transactional
    public void deleteWorkshop(Long workshopId) {
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Taller no encontrado"));

        long linkedIssues = issueRepository.countByWorkshopId(workshopId);
        if (linkedIssues > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede eliminar un taller con casos asociados");
        }

        Long mechanicId = workshop.getMechanicId();
        workshopRepository.delete(workshop);

        if (mechanicId != null) {
            userRepository.findById(mechanicId)
                    .filter(user -> user.getRole() == UserRole.TALLER)
                    .ifPresent(userRepository::delete);
        }
    }

    private WorkshopApplication getApplication(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada"));
    }

    private WorkshopApplicationResponseDTO toDto(WorkshopApplication application) {
        return WorkshopApplicationResponseDTO.builder()
                .id(application.getId())
                .fullName(application.getApplicantFullName())
                .email(application.getApplicantEmail())
                .workshopName(application.getWorkshopName())
                .address(application.getAddress())
                .phone(application.getPhone())
                .schedule(application.getSchedule())
                .photoUrl(application.getPhotoUrl())
                .vehicleLimit(application.getVehicleLimit())
                .status(application.getStatus())
                .approvedWorkshopId(application.getApprovedWorkshop() == null ? null : application.getApprovedWorkshop().getId())
                .approvedMechanicId(application.getApprovedMechanic() == null ? null : application.getApprovedMechanic().getId())
                .createdAt(application.getCreatedAt())
                .reviewedAt(application.getReviewedAt())
                .build();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String defaultPhoto(String photoUrl) {
        if (photoUrl == null || photoUrl.isBlank()) {
            return "/taller1.png";
        }
        return photoUrl.trim();
    }

    private String buildAvatarUrl(String fullName, UserRole role) {
        String seed = URLEncoder.encode(fullName.isBlank() ? role.name() : fullName, StandardCharsets.UTF_8);
        return "https://api.dicebear.com/9.x/initials/svg?seed=" + seed + "&backgroundColor=1a6bbd";
    }
}