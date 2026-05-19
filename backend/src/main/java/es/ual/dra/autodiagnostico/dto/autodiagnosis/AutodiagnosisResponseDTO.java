package es.ual.dra.autodiagnostico.dto.autodiagnosis;

import java.util.List;

public record AutodiagnosisResponseDTO(
        String diagnosis,
        double confidence,
        String explanation,
        List<DiagnosedPartDTO> suggestedParts,
        List<String> unresolvedPartNames
) {}
