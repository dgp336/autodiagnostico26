package es.ual.dra.autodiagnostico.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import es.ual.dra.autodiagnostico.dto.ContactMessageDTO;
import es.ual.dra.autodiagnostico.dto.ContactRequestDTO;
import es.ual.dra.autodiagnostico.dto.ReplyRequestDTO;
import es.ual.dra.autodiagnostico.model.entitity.contact.ContactMessage;
import es.ual.dra.autodiagnostico.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactService {

    private final ContactMessageRepository repository;

    @Value("${app.contact.formspree-url:}")
    private String formspreeUrl;

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    public ContactMessageDTO save(ContactRequestDTO request) {
        ContactMessage msg = ContactMessage.builder()
            .name(request.name())
            .email(request.email())
            .phone(request.phone())
            .message(request.message())
            .workshopId(request.workshopId())
            .createdAt(LocalDateTime.now())
            .build();
        msg = repository.save(msg);
        forwardToFormspree(request);
        return toDTO(msg);
    }

    public List<ContactMessageDTO> listAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
            .map(this::toDTO)
            .toList();
    }

    public void reply(Long id, ReplyRequestDTO reply) {
        ContactMessage msg = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Mensaje no encontrado: " + id));

        if (resendApiKey == null || resendApiKey.isBlank()) {
            throw new IllegalStateException(
                "Resend no está configurado. Define la variable RESEND_API_KEY."
            );
        }

        try {
            HttpClient client = HttpClient.newHttpClient();
            String body = """
                {"from":"AutoDiagnóstico <onboarding@resend.dev>","to":"%s","subject":"Respuesta de AutoDiagnóstico – %s","text":"%s"}
                """.formatted(
                    msg.getEmail(),
                    escapeJson(msg.getName()),
                    escapeJson(reply.message())
                );
            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + resendApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
            HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());

            if (res.statusCode() >= 400) {
                log.warn("Resend error {}: {}", res.statusCode(), res.body());
                throw new RuntimeException("Error al enviar email (código " + res.statusCode() + ")");
            }

            msg.setRepliedAt(LocalDateTime.now());
            repository.save(msg);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar email vía Resend", e);
        }
    }

    private void forwardToFormspree(ContactRequestDTO request) {
        if (formspreeUrl == null || formspreeUrl.isBlank()) return;
        try {
            HttpClient client = HttpClient.newHttpClient();
            String body = """
                {"name":"%s","email":"%s","phone":"%s","message":"%s","workshopId":%s,"_subject":"Consulta desde taller #%s"}
                """.formatted(
                    escapeJson(request.name()),
                    escapeJson(request.email()),
                    escapeJson(request.phone() != null ? request.phone() : ""),
                    escapeJson(request.message()),
                    request.workshopId() != null ? request.workshopId().toString() : "null",
                    request.workshopId() != null ? request.workshopId().toString() : "?"
                );
            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(formspreeUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
            client.send(req, HttpResponse.BodyHandlers.discarding());
        } catch (Exception e) {
            log.warn("Error reenviando a Formspree", e);
        }
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private ContactMessageDTO toDTO(ContactMessage msg) {
        return new ContactMessageDTO(
            msg.getId(), msg.getName(), msg.getEmail(), msg.getPhone(),
            msg.getMessage(), msg.getWorkshopId(), msg.getCreatedAt(), msg.getRepliedAt()
        );
    }
}
