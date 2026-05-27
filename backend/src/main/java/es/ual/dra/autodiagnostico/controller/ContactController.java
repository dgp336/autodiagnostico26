package es.ual.dra.autodiagnostico.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import es.ual.dra.autodiagnostico.dto.ContactMessageDTO;
import es.ual.dra.autodiagnostico.dto.ContactRequestDTO;
import es.ual.dra.autodiagnostico.dto.ReplyRequestDTO;
import es.ual.dra.autodiagnostico.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping("/api/contact")
    public ResponseEntity<ContactMessageDTO> submit(@Valid @RequestBody ContactRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contactService.save(request));
    }

    @GetMapping("/api/admin/contact")
    public ResponseEntity<List<ContactMessageDTO>> listAll() {
        return ResponseEntity.ok(contactService.listAll());
    }

    @PostMapping("/api/admin/contact/{id}/reply")
    public ResponseEntity<Void> reply(@PathVariable Long id, @Valid @RequestBody ReplyRequestDTO request) {
        contactService.reply(id, request);
        return ResponseEntity.ok().build();
    }
}
