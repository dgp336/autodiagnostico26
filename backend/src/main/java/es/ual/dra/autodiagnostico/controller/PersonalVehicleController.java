package es.ual.dra.autodiagnostico.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import es.ual.dra.autodiagnostico.dto.CreatePersonalVehicleRequestDTO;
import es.ual.dra.autodiagnostico.dto.PersonalVehicleResponseDTO;
import es.ual.dra.autodiagnostico.service.PersonalVehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/personal-vehicles")
@RequiredArgsConstructor
public class PersonalVehicleController {

    private final PersonalVehicleService personalVehicleService;

    @GetMapping
    public ResponseEntity<List<PersonalVehicleResponseDTO>> listByOwner(@RequestParam Long ownerId) {
        return ResponseEntity.ok(personalVehicleService.listByOwner(ownerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonalVehicleResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(personalVehicleService.getById(id));
    }

    @PostMapping
    public ResponseEntity<PersonalVehicleResponseDTO> create(@Valid @RequestBody CreatePersonalVehicleRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(personalVehicleService.create(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @RequestParam Long ownerId) {
        personalVehicleService.delete(id, ownerId);
        return ResponseEntity.noContent().build();
    }
}
