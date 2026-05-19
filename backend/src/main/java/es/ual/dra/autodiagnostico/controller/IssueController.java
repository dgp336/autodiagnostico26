package es.ual.dra.autodiagnostico.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.ual.dra.autodiagnostico.dto.autodiagnosis.AutodiagnosisRequestDTO;
import es.ual.dra.autodiagnostico.dto.autodiagnosis.AutodiagnosisResponseDTO;
import es.ual.dra.autodiagnostico.service.IssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @PostMapping
    public AutodiagnosisResponseDTO createIssue(@Valid @RequestBody AutodiagnosisRequestDTO request) {
        return issueService.createDraftIssue(request);
    }
}