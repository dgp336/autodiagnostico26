package es.ual.dra.autodiagnostico.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import es.ual.dra.autodiagnostico.dto.autodiagnosis.AutodiagnosisRequestDTO;
import es.ual.dra.autodiagnostico.dto.autodiagnosis.AutodiagnosisResponseDTO;
import es.ual.dra.autodiagnostico.dto.autodiagnosis.DiagnosedPartDTO;
import es.ual.dra.autodiagnostico.model.entitity.core.Issue;
import es.ual.dra.autodiagnostico.model.entitity.core.IssueStatus;
import es.ual.dra.autodiagnostico.model.entitity.core.PersonalVehicle;
import es.ual.dra.autodiagnostico.model.entitity.user.AppUser;
import es.ual.dra.autodiagnostico.model.entitity.user.UserRole;
import es.ual.dra.autodiagnostico.repository.IssueRepository;
import es.ual.dra.autodiagnostico.repository.PersonalVehicleRepository;
import es.ual.dra.autodiagnostico.repository.UserRepository;
import es.ual.dra.autodiagnostico.service.autodiagnosis.AutodiagnosisService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final AutodiagnosisService autodiagnosisService;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final PersonalVehicleRepository personalVehicleRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public AutodiagnosisResponseDTO createDraftIssue(AutodiagnosisRequestDTO request) {
        AppUser client = getClient(request.clientId());
        PersonalVehicle personalVehicle = getPersonalVehicle(request.personalVehicleId());
        validateVehicleOwnership(client, personalVehicle);

        issueRepository.findByPersonalVehicleOwnerIdAndPersonalVehicleIdAndActiveTrue(
                client.getId(), personalVehicle.getId()).forEach(issue -> issue.setActive(false));

        AutodiagnosisResponseDTO diagnosis = autodiagnosisService.diagnose(request);

        Issue issue = Issue.builder()
                .personalVehicle(personalVehicle)
                .description(buildProblemDescription(request))
                .aiDiagnosis(diagnosis.diagnosis())
                .recommendedParts(serializeParts(diagnosis.suggestedParts()))
                .estimatedPrice(estimatePrice(diagnosis.suggestedParts()))
                .status(IssueStatus.DRAFT)
                .progressColor("gris")
                .latestUpdate("Diagnóstico IA creado. Pendiente de asignar taller.")
                .active(true)
                .build();

        issueRepository.save(issue);
        return diagnosis;
    }

    private AppUser getClient(Long clientId) {
        if (clientId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "clientId es obligatorio");
        }
        return userRepository.findById(clientId)
                .filter(user -> user.getRole() == UserRole.USER)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
    }

    private PersonalVehicle getPersonalVehicle(Long personalVehicleId) {
        if (personalVehicleId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "personalVehicleId es obligatorio");
        }
        return personalVehicleRepository.findById(personalVehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehiculo no encontrado"));
    }

    private void validateVehicleOwnership(AppUser client, PersonalVehicle personalVehicle) {
        if (personalVehicle.getOwner() == null || !personalVehicle.getOwner().getId().equals(client.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El vehiculo no pertenece al cliente");
        }
    }

    private String buildProblemDescription(AutodiagnosisRequestDTO request) {
        String symptomText = Optional.ofNullable(request.symptoms())
                .orElse(List.of())
                .stream()
                .reduce((left, right) -> left + ", " + right)
                .orElse("");
        String freeText = Optional.ofNullable(request.freeText())
                .map(String::trim)
                .filter(text -> !text.isBlank())
                .orElse("");

        if (!symptomText.isBlank() && !freeText.isBlank()) {
            return symptomText + " | " + freeText;
        }
        return !symptomText.isBlank() ? symptomText : freeText;
    }

    private String serializeParts(List<DiagnosedPartDTO> parts) {
        try {
            return objectMapper.writeValueAsString(Optional.ofNullable(parts).orElse(List.of()));
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("No se han podido guardar las piezas recomendadas", ex);
        }
    }

    private BigDecimal estimatePrice(List<DiagnosedPartDTO> parts) {
        BigDecimal total = BigDecimal.ZERO;
        for (DiagnosedPartDTO part : Optional.ofNullable(parts).orElse(List.of())) {
            BigDecimal low = toDecimal(part.lowRangePrice());
            BigDecimal high = toDecimal(part.highRangePrice());
            BigDecimal value;
            if (low != null && high != null) {
                value = low.add(high).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            } else if (low != null) {
                value = low;
            } else if (high != null) {
                value = high;
            } else {
                continue;
            }
            total = total.add(value);
        }
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal toDecimal(Double value) {
        return value == null ? null : BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }
}