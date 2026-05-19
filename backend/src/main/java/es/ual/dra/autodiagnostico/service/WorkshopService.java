package es.ual.dra.autodiagnostico.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import es.ual.dra.autodiagnostico.dto.MechanicClientDTO;
import es.ual.dra.autodiagnostico.dto.autodiagnosis.DiagnosedPartDTO;
import es.ual.dra.autodiagnostico.dto.RepairVehicleMockDTO;
import es.ual.dra.autodiagnostico.dto.WorkshopDTO;
import es.ual.dra.autodiagnostico.dto.WorkshopSelectionRequestDTO;
import es.ual.dra.autodiagnostico.dto.WorkshopSelectionResponseDTO;
import es.ual.dra.autodiagnostico.model.entitity.core.Issue;
import es.ual.dra.autodiagnostico.model.entitity.core.IssueStatus;
import es.ual.dra.autodiagnostico.model.entitity.core.PersonalVehicle;
import es.ual.dra.autodiagnostico.model.entitity.core.Workshop;
import es.ual.dra.autodiagnostico.model.entitity.user.AppUser;
import es.ual.dra.autodiagnostico.model.entitity.user.UserRole;
import es.ual.dra.autodiagnostico.repository.IssueRepository;
import es.ual.dra.autodiagnostico.repository.PersonalVehicleRepository;
import es.ual.dra.autodiagnostico.repository.UserRepository;
import es.ual.dra.autodiagnostico.repository.WorkshopRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkshopService {

    private final WorkshopRepository workshopRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final PersonalVehicleRepository personalVehicleRepository;

    @Transactional(readOnly = true)
    public List<WorkshopDTO> listWorkshops(Long clientId) {
        return workshopRepository.findAll().stream()
                .map(workshop -> toDto(workshop, clientId))
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkshopDTO getWorkshop(Long workshopId, Long clientId) {
        Workshop workshop = getWorkshopOrThrow(workshopId);
        return toDto(workshop, clientId);
    }

    @Transactional
    public WorkshopSelectionResponseDTO selectWorkshop(Long workshopId, WorkshopSelectionRequestDTO request) {
        if (request == null || request.getClientId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "clientId es obligatorio");
        }
        if (request.getPersonalVehicleId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "personalVehicleId es obligatorio");
        }

        Workshop workshop = getWorkshopOrThrow(workshopId);
        AppUser client = userRepository.findById(request.getClientId())
                .filter(user -> user.getRole() == UserRole.USER)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        PersonalVehicle personalVehicle = personalVehicleRepository.findById(request.getPersonalVehicleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehiculo no encontrado"));

        if (personalVehicle.getOwner() == null || !personalVehicle.getOwner().getId().equals(client.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El vehiculo no pertenece al cliente");
        }

        AppUser mechanic = getMechanic(workshop);

        Issue issue = issueRepository
            .findFirstByPersonalVehicleOwnerIdAndPersonalVehicleIdAndStatusAndActiveTrueOrderByCreatedAtDesc(
                client.getId(),
                personalVehicle.getId(),
                IssueStatus.DRAFT)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "No existe un diagnostico previo para este vehiculo"));

        long activeIssues = issueRepository.countByWorkshopMechanicIdAndActiveTrue(mechanic.getId());
        if (activeIssues >= workshop.getVehicleLimit()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El taller ha alcanzado su capacidad maxima");
        }

        issue.setWorkshop(workshop);
        issue.setSessionUuid(UUID.randomUUID().toString());
        issue.setStatus(IssueStatus.WORKSHOP_ASSIGNED);
        issue.setProgressColor("amarillo");
        issue.setLatestUpdate("Taller seleccionado. Pendiente de primera revision del mecanico.");
        issue.setActive(true);
        issue = issueRepository.save(issue);

        return WorkshopSelectionResponseDTO.builder()
                .workshop(toDto(workshop, client.getId()))
                .tracking(toTrackingDto(issue, client))
                .build();
    }

    private Workshop getWorkshopOrThrow(Long workshopId) {
        return workshopRepository.findById(workshopId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Taller no encontrado"));
    }

    private AppUser getMechanic(Workshop workshop) {
        return userRepository.findById(workshop.getMechanicId())
                .filter(user -> user.getRole() == UserRole.TALLER)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mecanico del taller no encontrado"));
    }

    private WorkshopDTO toDto(Workshop workshop, Long clientId) {
        AppUser mechanic = getMechanic(workshop);
        Issue activeClientIssue = findClientIssueForWorkshop(workshop, clientId);
        long activeVehicles = issueRepository.countByWorkshopMechanicIdAndActiveTrue(mechanic.getId());

        return WorkshopDTO.builder()
                .id(workshop.getId())
                .name(workshop.getName())
                .address(workshop.getAddress())
                .phone(workshop.getPhone())
                .email(workshop.getEmail())
                .schedule(workshop.getSchedule())
                .photoUrl(workshop.getPhotoUrl())
                .vehicleLimit(workshop.getVehicleLimit())
                .activeVehicles(activeVehicles)
                .mechanicId(mechanic.getId())
                .mechanicName(mechanic.getFullName())
                .mechanicAvatar(mechanic.getAvatarUrl())
                .latitude(workshop.getLatitude())
                .longitude(workshop.getLongitude())
                .selectedByClient(activeClientIssue != null)
                .sessionUuid(activeClientIssue == null ? null : activeClientIssue.getSessionUuid())
                .vehiclesInRepair(buildVehicleMocks(activeClientIssue))
                .build();
    }

    private Issue findClientIssueForWorkshop(Workshop workshop, Long clientId) {
        if (clientId == null) {
            return null;
        }
        return issueRepository
                .findByWorkshopMechanicIdAndPersonalVehicleOwnerIdAndActiveTrue(workshop.getMechanicId(), clientId)
                .orElse(null);
    }

    private List<RepairVehicleMockDTO> buildVehicleMocks(Issue issue) {
        if (issue == null) {
            return List.of();
        }
        PersonalVehicle pv = issue.getPersonalVehicle();
        String displayName = pv != null && pv.getVehicleModel() != null && pv.getVehicleModel().getVehicle() != null
                ? (pv.getVehicleModel().getVehicle().getBrand() + " "
                        + pv.getVehicleModel().getVehicle().getName())
                : "Vehiculo";
        return List.of(
                RepairVehicleMockDTO.builder()
                        .id(issue.getId())
                        .name(displayName)
                        .plate(pv == null ? null : pv.getPlate())
                        .status(issue.getProgressColor())
                        .build());
    }

    private MechanicClientDTO toTrackingDto(Issue issue, AppUser client) {
        return MechanicClientDTO.builder()
                .clientId(client.getId())
                .clientName(client.getFullName())
                .clientEmail(client.getEmail())
                .clientAvatar(client.getAvatarUrl())
                .carInfo(buildCarInfo(issue))
                .problemDescription(issue.getDescription())
                .aiDiagnosis(issue.getAiDiagnosis())
                .recommendedParts(deserializeRecommendedParts(issue.getRecommendedParts()))
                .estimatedPrice(issue.getEstimatedPrice())
                .status(issue.getProgressColor())
                .latestUpdate(issue.getLatestUpdate())
                .sessionUuid(issue.getSessionUuid())
                .issueId(issue.getId())
                .build();
    }

    private String buildCarInfo(Issue issue) {
        if (issue.getPersonalVehicle() == null || issue.getPersonalVehicle().getVehicleModel() == null) {
            return null;
        }
        var model = issue.getPersonalVehicle().getVehicleModel();
        String brand = model.getVehicle() == null ? "" : model.getVehicle().getBrand();
        String name = model.getVehicle() == null ? "" : model.getVehicle().getName();
        return (brand + " " + name + " " + model.getModelName()).trim();
    }

    private List<DiagnosedPartDTO> deserializeRecommendedParts(String recommendedParts) {
        if (recommendedParts == null || recommendedParts.isBlank()) {
            return List.of();
        }
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().readValue(
                    recommendedParts,
                    new com.fasterxml.jackson.core.type.TypeReference<List<DiagnosedPartDTO>>() {
                    });
        } catch (Exception ex) {
            return List.of();
        }
    }
}
