package es.ual.dra.autodiagnostico.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.ual.dra.autodiagnostico.dto.MechanicClientDTO;
import es.ual.dra.autodiagnostico.service.MechanicService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mechanic")
@RequiredArgsConstructor
public class MechanicController {

    private final MechanicService mechanicService;

    @GetMapping("/{mechanicId}/clients")
    public ResponseEntity<List<MechanicClientDTO>> getClientsForMechanic(@PathVariable Long mechanicId) {
        List<MechanicClientDTO> clients = mechanicService.getClientsForMechanic(mechanicId);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/client/{clientId}/trackings")
    public ResponseEntity<List<MechanicClientDTO>> getTrackingsForClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(mechanicService.getTrackingsForClient(clientId));
    }


    @GetMapping("/tracking/{sessionUuid}")
    public ResponseEntity<MechanicClientDTO> getTrackingBySessionUuid(@PathVariable String sessionUuid) {
        MechanicClientDTO tracking = mechanicService.getTrackingBySessionUuid(sessionUuid);
        return tracking == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(tracking);
    }

    @PostMapping("/{mechanicId}/tracking/{sessionUuid}/status")
    public ResponseEntity<Void> updateTrackingStatus(
            @PathVariable Long mechanicId,
            @PathVariable String sessionUuid,
            @RequestBody StatusUpdateRequest request) {
        mechanicService.updateClientStatusBySessionUuid(mechanicId, sessionUuid, request.getStatus());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{mechanicId}/tracking/{sessionUuid}/tracking-update")
    public ResponseEntity<Void> updateTrackingMessageBySessionUuid(
            @PathVariable Long mechanicId,
            @PathVariable String sessionUuid,
            @RequestBody TrackingUpdateRequest request) {
        mechanicService.updateLatestTrackingMessageBySessionUuid(mechanicId, sessionUuid, request.getMessage());
        return ResponseEntity.ok().build();
    }

    @lombok.Data
    public static class StatusUpdateRequest {
        private String status;
    }

    @lombok.Data
    public static class TrackingUpdateRequest {
        private String message;
    }
}
