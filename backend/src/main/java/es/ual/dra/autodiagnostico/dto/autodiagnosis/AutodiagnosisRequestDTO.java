package es.ual.dra.autodiagnostico.dto.autodiagnosis;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AutodiagnosisRequestDTO(
        Long clientId,
        Long personalVehicleId,
        @NotNull Long vehicleModelId,
        @Size(min = 1, max = 20) List<@NotBlank String> symptoms,
        @Size(max = 2000) String freeText,
        Integer year,
        String engineType,
        String transmission
) {}
