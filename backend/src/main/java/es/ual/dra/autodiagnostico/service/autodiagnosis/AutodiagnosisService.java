package es.ual.dra.autodiagnostico.service.autodiagnosis;

import es.ual.dra.autodiagnostico.dto.autodiagnosis.AutodiagnosisRequestDTO;
import es.ual.dra.autodiagnostico.dto.autodiagnosis.AutodiagnosisResponseDTO;
import es.ual.dra.autodiagnostico.dto.autodiagnosis.DiagnosedPartDTO;
import es.ual.dra.autodiagnostico.dto.autodiagnosis.LlmDiagnosisResult;
import es.ual.dra.autodiagnostico.model.entitity.core.VehicleModel;
import es.ual.dra.autodiagnostico.repository.ProductRepository;
import es.ual.dra.autodiagnostico.repository.VehicleModelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Orquesta el flujo de autodiagnóstico:
 *   1) Resuelve el vehículo en MySQL (fuente de verdad).
 *   2) Construye un prompt con el contexto del vehículo + síntomas + descripción libre.
 *   3) Llama al LLM (Claude vía Spring AI ChatClient). Spring AI gestiona
 *      automáticamente el bucle tool_use con las tools expuestas por el mcp-server.
 *   4) Resuelve los nombres de pieza devueltos contra la tabla product
 *      (anti-alucinación) y enriquece con datos reales.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AutodiagnosisService {

    private static final String SYSTEM_PROMPT = """
            Eres un asistente experto en diagnóstico mecánico de automóviles.

            REGLAS DURAS:
            1. Recibirás en el mensaje del usuario el contexto del vehículo ya resuelto.
            2. ANTES de razonar el diagnóstico, invoca la tool `get_candidate_parts`
               pasándole el `engineType` EXACTO que aparece en el contexto.
            3. El campo `selectedPartNames` SOLO puede contener nombres EXACTAMENTE
               iguales a los devueltos por `get_candidate_parts`. Cualquier nombre
               fuera de esa lista será descartado por el backend.
            4. NO inventes piezas, precios ni referencias. NO accedas a otras fuentes.
            5. Devuelve SIEMPRE un JSON con esta forma exacta:
               {
                 "diagnosis": "...",
                 "confidence": 0.0,
                 "explanation": "...",
                 "selectedPartNames": ["...", "..."]
               }
            6. `confidence` ∈ [0, 1]. Si los síntomas son ambiguos, usa un valor < 0.5.
            7. `selectedPartNames` puede ser una lista vacía si los síntomas
               sugieren revisión y no reemplazo directo.
            8. Responde en español, sin Markdown alrededor del JSON.
            """;

    private final ChatClient diagnosisChatClient;
    private final VehicleModelRepository vehicleModelRepository;
    private final ProductRepository productRepository;

    public AutodiagnosisResponseDTO diagnose(AutodiagnosisRequestDTO request) {
        VehicleModel vm = vehicleModelRepository.findById(request.vehicleModelId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "VehicleModel no encontrado: " + request.vehicleModelId()));

        String userPrompt = buildUserPrompt(request, vm);

        log.info("Solicitando diagnóstico al LLM para vehicleModelId={}", request.vehicleModelId());

        LlmDiagnosisResult llmOut = diagnosisChatClient.prompt()
                .system(SYSTEM_PROMPT)
                .user(userPrompt)
                .call()
                .entity(LlmDiagnosisResult.class);

        if (llmOut == null) {
            throw new IllegalStateException("La respuesta del LLM no se pudo parsear como JSON.");
        }

        List<DiagnosedPartDTO> resolved = new ArrayList<>();
        List<String> unresolved = new ArrayList<>();
        for (String partName : Optional.ofNullable(llmOut.selectedPartNames()).orElse(List.of())) {
            productRepository.findByName(partName).ifPresentOrElse(
                    product -> resolved.add(DiagnosedPartDTO.from(product)),
                    () -> unresolved.add(partName));
        }
        if (!unresolved.isEmpty()) {
            log.warn("[AntiHallucination] Nombres de pieza no encontrados en BD: {}", unresolved);
        }

        return new AutodiagnosisResponseDTO(
                Optional.ofNullable(llmOut.diagnosis()).orElse(""),
                clampConfidence(llmOut.confidence()),
                Optional.ofNullable(llmOut.explanation()).orElse(""),
                resolved,
                unresolved);
    }

    private String buildUserPrompt(AutodiagnosisRequestDTO req, VehicleModel vm) {
        String engineType = vm.getEngine() != null && vm.getEngine().getEngineType() != null
                ? vm.getEngine().getEngineType().name()
                : Optional.ofNullable(req.engineType()).orElse("DESCONOCIDO");
        String engineName = vm.getEngine() != null ? vm.getEngine().getName() : "(no indicado)";
        String transmission = vm.getTransmission() != null ? vm.getTransmission().name()
                : Optional.ofNullable(req.transmission()).orElse("(no indicado)");
        String yearStr = req.year() != null ? req.year().toString() : String.valueOf(vm.getYearFirstProduction());
        String brand = vm.getVehicle() != null ? vm.getVehicle().getBrand() : "(desconocida)";
        String vehicleName = vm.getVehicle() != null ? vm.getVehicle().getName() : "(desconocido)";

        String symptoms = req.symptoms() == null
                ? "(ninguno)"
                : req.symptoms().stream().map(s -> " - " + s).collect(Collectors.joining("\n"));

        return """
                Contexto del vehículo:
                  Marca: %s
                  Modelo base: %s
                  Variante: %s
                  Año: %s
                  Motor: %s
                  engineType: %s
                  Transmisión: %s

                Síntomas seleccionados por el usuario:
                %s

                Descripción libre del usuario:
                %s

                Tarea: invoca `get_candidate_parts("%s")`, diagnostica la avería más
                probable y selecciona piezas relevantes solo de la lista devuelta.
                Devuelve el JSON descrito en las reglas del sistema.
                """.formatted(
                brand,
                vehicleName,
                vm.getModelName(),
                yearStr,
                engineName,
                engineType,
                transmission,
                symptoms,
                Optional.ofNullable(req.freeText()).filter(s -> !s.isBlank()).orElse("(ninguna)"),
                engineType);
    }

    private double clampConfidence(Double c) {
        if (c == null) {
            return 0.0;
        }
        return Math.max(0.0, Math.min(1.0, c));
    }
}
