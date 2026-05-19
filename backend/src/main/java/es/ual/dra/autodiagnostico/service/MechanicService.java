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
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MechanicService {

    private final IssueRepository issueRepository;
    private final ObjectMapper objectMapper;

    public MechanicClientDTO getTrackingForClient(Long clientId) {
        Issue issue = issueRepository.findFirstByPersonalVehicleOwnerIdAndActiveTrue(clientId).orElse(null);
        if (issue == null) {
            return null;
        }
        return toDto(issue);
    }

    public List<MechanicClientDTO> getClientsForMechanic(Long mechanicId) {
        List<Issue> issues = issueRepository.findByWorkshopMechanicIdAndActiveTrue(mechanicId);
        return issues.stream().map(this::toDto).collect(Collectors.toList());
    }

    public void updateClientStatus(Long mechanicId, Long clientId, String newStatus) {
        Issue issue = issueRepository
                .findByWorkshopMechanicIdAndPersonalVehicleOwnerIdAndActiveTrue(mechanicId, clientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expediente no encontrado"));

        validateProgressColor(newStatus);
        issue.setProgressColor(newStatus.toLowerCase());
        issue.setUpdatedAt(LocalDateTime.now());
        issueRepository.save(issue);
    }

    public void updateLatestTrackingMessage(Long mechanicId, Long clientId, String latestUpdate) {
        Issue issue = issueRepository
                .findByWorkshopMechanicIdAndPersonalVehicleOwnerIdAndActiveTrue(mechanicId, clientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expediente no encontrado"));

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

    private MechanicClientDTO toDto(Issue issue) {
        AppUser client = issue.getClient();
        if (client == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado");
        }
        return MechanicClientDTO.builder()
                .clientId(client.getId())
                .clientName(client.getFullName())
                .clientEmail(client.getEmail())
                .clientAvatar(client.getAvatarUrl())
                .carInfo(buildCarInfo(issue))
                .problemDescription(issue.getDescription())
            .aiDiagnosis(issue.getAiDiagnosis())
            .recommendedParts(readRecommendedParts(issue.getRecommendedParts()))
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
