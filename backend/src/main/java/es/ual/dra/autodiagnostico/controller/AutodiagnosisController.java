package es.ual.dra.autodiagnostico.controller;

import es.ual.dra.autodiagnostico.dto.autodiagnosis.AutodiagnosisRequestDTO;
import es.ual.dra.autodiagnostico.dto.autodiagnosis.AutodiagnosisResponseDTO;
import es.ual.dra.autodiagnostico.service.autodiagnosis.AutodiagnosisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/autodiagnosis")
@RequiredArgsConstructor
public class AutodiagnosisController {

    private final AutodiagnosisService service;

    @PostMapping("/diagnose")
    public AutodiagnosisResponseDTO diagnose(@Valid @RequestBody AutodiagnosisRequestDTO req) {
        return service.diagnose(req);
    }
}
