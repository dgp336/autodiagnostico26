package es.ual.dra.autodiagnostico.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import es.ual.dra.autodiagnostico.dto.MechanicClientDTO;
import es.ual.dra.autodiagnostico.dto.autodiagnosis.DiagnosedPartDTO;
import es.ual.dra.autodiagnostico.model.entitity.core.Issue;
import es.ual.dra.autodiagnostico.model.entitity.user.AppUser;
import es.ual.dra.autodiagnostico.repository.IssueRepository;
import es.ual.dra.autodiagnostico.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MechanicService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public MechanicClientDTO getTrackingBySessionUuid(String sessionUuid) {
        if (sessionUuid == null || sessionUuid.isBlank()) {
            return null;
        }

        return issueRepository.findBySessionUuid(sessionUuid)
                .map(this::toDto)
                .orElse(null);
    }

    public List<MechanicClientDTO> getClientsForMechanic(Long mechanicId) {
        List<Issue> issues = issueRepository.findByWorkshopMechanicIdAndActiveTrue(mechanicId);
        return issues.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<MechanicClientDTO> getTrackingsForClient(Long clientId) {
        return issueRepository.findByPersonalVehicleOwnerIdAndActiveTrueOrderByCreatedAtDesc(clientId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void updateClientStatusBySessionUuid(Long mechanicId, String sessionUuid, String newStatus) {
        Issue issue = resolveIssueForMechanic(mechanicId, sessionUuid);

        validateProgressColor(newStatus);
        issue.setProgressColor(newStatus.toLowerCase());

        LocalDateTime now = LocalDateTime.now();
        if ("amarillo".equalsIgnoreCase(newStatus) && issue.getAcceptedAt() == null) {
            issue.setAcceptedAt(now);
        } else if ("naranja".equalsIgnoreCase(newStatus) && issue.getInProgressAt() == null) {
            issue.setInProgressAt(now);
        } else if ("verde".equalsIgnoreCase(newStatus) && issue.getFixedAt() == null) {
            issue.setFixedAt(now);
        }

        issue.setUpdatedAt(LocalDateTime.now());
        issueRepository.save(issue);
    }

    public void updateLatestTrackingMessageBySessionUuid(Long mechanicId, String sessionUuid, String latestUpdate) {
        Issue issue = resolveIssueForMechanic(mechanicId, sessionUuid);

        String normalized = latestUpdate == null ? "" : latestUpdate.trim();
        if (normalized.length() > 1500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La actualización es demasiado larga");
        }

        issue.setLatestUpdate(normalized.isEmpty() ? null : normalized);
        issue.setUpdatedAt(LocalDateTime.now());
        issueRepository.save(issue);
    }

    private void validateProgressColor(String status) {
        List<String> validStatuses = List.of("verde", "amarillo", "naranja", "rojo");
        if (status == null || !validStatuses.contains(status.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado inválido: " + status);
        }
    }

    private Issue resolveIssueForMechanic(Long mechanicId, String sessionUuid) {
        Issue issue = issueRepository.findBySessionUuid(sessionUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expediente no encontrado"));

        Long issueMechanicId = issue.getWorkshop() == null ? null : issue.getWorkshop().getMechanicId();
        if (issueMechanicId == null || !issueMechanicId.equals(mechanicId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Expediente no encontrado");
        }

        return issue;
    }

    private MechanicClientDTO toDto(Issue issue) {
        AppUser client = issue.getClient();
        if (client == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado");
        }
        Long mechanicId = issue.getWorkshop() == null ? null : issue.getWorkshop().getMechanicId();
        String mechanicName = mechanicId == null
                ? null
                : userRepository.findById(mechanicId).map(AppUser::getFullName).orElse(null);
        return MechanicClientDTO.builder()
                .clientId(client.getId())
                .workshopId(issue.getWorkshop() == null ? null : issue.getWorkshop().getId())
                .workshopName(issue.getWorkshop() == null ? null : issue.getWorkshop().getName())
                .mechanicId(mechanicId)
                .mechanicName(mechanicName)
                .clientName(client.getFullName())
                .clientEmail(client.getEmail())
                .clientAvatar(client.getAvatarUrl())
                .carInfo(buildCarInfo(issue))
                .problemDescription(issue.getDescription())
                .aiDiagnosis(issue.getAiDiagnosis())
                .recommendedParts(readRecommendedParts(issue.getRecommendedParts()))
                .estimatedPrice(issue.getEstimatedPrice())
                .createdAt(issue.getCreatedAt())
                .acceptedAt(issue.getAcceptedAt())
                .inProgressAt(issue.getInProgressAt())
                .fixedAt(issue.getFixedAt())
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

    private List<DiagnosedPartDTO> readRecommendedParts(String recommendedParts) {
        if (recommendedParts == null || recommendedParts.isBlank()) {
            return List.of();
        }

        try {
            return objectMapper.readValue(recommendedParts, new TypeReference<List<DiagnosedPartDTO>>() {
            });
        } catch (Exception ex) {
            return List.of();
        }
    }
}
