package es.ual.dra.autodiagnostico.dto.autodiagnosis;

import java.util.List;

public record LlmDiagnosisResult(
        String diagnosis,
        Double confidence,
        String explanation,
        List<String> selectedPartNames
) {}
