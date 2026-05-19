package es.ual.dra.autodiagnostico.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import es.ual.dra.autodiagnostico.dto.WorkshopDTO;
import es.ual.dra.autodiagnostico.dto.WorkshopSelectionRequestDTO;
import es.ual.dra.autodiagnostico.dto.WorkshopSelectionResponseDTO;
import es.ual.dra.autodiagnostico.service.WorkshopService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workshops")
@RequiredArgsConstructor
public class WorkshopController {

    private final WorkshopService workshopService;

    @GetMapping
    public ResponseEntity<List<WorkshopDTO>> listWorkshops(@RequestParam(required = false) Long clientId) {
        return ResponseEntity.ok(workshopService.listWorkshops(clientId));
    }

    @GetMapping("/{workshopId}")
    public ResponseEntity<WorkshopDTO> getWorkshop(
            @PathVariable Long workshopId,
            @RequestParam(required = false) Long clientId) {
        return ResponseEntity.ok(workshopService.getWorkshop(workshopId, clientId));
    }

    @PostMapping("/{workshopId}/select")
    public ResponseEntity<WorkshopSelectionResponseDTO> selectWorkshop(
            @PathVariable Long workshopId,
            @RequestBody WorkshopSelectionRequestDTO request) {
        return ResponseEntity.ok(workshopService.selectWorkshop(workshopId, request));
    }
}
