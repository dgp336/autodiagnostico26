package es.ual.dra.autodiagnostico.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.ual.dra.autodiagnostico.dto.WorkshopApplicationRequestDTO;
import es.ual.dra.autodiagnostico.dto.WorkshopApplicationResponseDTO;
import es.ual.dra.autodiagnostico.service.WorkshopApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workshop-applications")
@RequiredArgsConstructor
public class WorkshopApplicationController {

    private final WorkshopApplicationService workshopApplicationService;

    @PostMapping
    public ResponseEntity<WorkshopApplicationResponseDTO> submit(@Valid @RequestBody WorkshopApplicationRequestDTO request) {
        return ResponseEntity.ok(workshopApplicationService.submit(request));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<WorkshopApplicationResponseDTO>> listPending() {
        return ResponseEntity.ok(workshopApplicationService.listPending());
    }

    @PostMapping("/{applicationId}/approve")
    public ResponseEntity<WorkshopApplicationResponseDTO> approve(@PathVariable Long applicationId) {
        return ResponseEntity.ok(workshopApplicationService.approve(applicationId));
    }

    @PostMapping("/{applicationId}/reject")
    public ResponseEntity<WorkshopApplicationResponseDTO> reject(@PathVariable Long applicationId) {
        return ResponseEntity.ok(workshopApplicationService.reject(applicationId));
    }

    @DeleteMapping("/workshops/{workshopId}")
    public ResponseEntity<Void> deleteWorkshop(@PathVariable Long workshopId) {
        workshopApplicationService.deleteWorkshop(workshopId);
        return ResponseEntity.noContent().build();
    }
}