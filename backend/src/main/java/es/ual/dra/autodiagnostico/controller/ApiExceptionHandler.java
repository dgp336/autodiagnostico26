package es.ual.dra.autodiagnostico.controller;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.ai.retry.TransientAiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.function.client.WebClientRequestException;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(errorBody(HttpStatus.BAD_REQUEST, ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .collect(Collectors.joining("; "));

        if (message.isBlank()) {
            message = "La solicitud contiene datos invalidos";
        }

        return ResponseEntity.badRequest().body(errorBody(HttpStatus.BAD_REQUEST, message));
    }

    /**
     * Errores no recuperables del LLM (respuesta inválida, payload corrupto, etc).
     */
    @ExceptionHandler(NonTransientAiException.class)
    public ResponseEntity<Map<String, Object>> handleNonTransientAi(NonTransientAiException ex) {
        log.error("Error no recuperable del proveedor LLM", ex);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(errorBody(HttpStatus.BAD_GATEWAY,
                        "El asistente IA devolvió una respuesta no válida. Inténtelo más tarde."));
    }

    /**
     * Errores transitorios del LLM (rate limit, 5xx temporal).
     */
    @ExceptionHandler(TransientAiException.class)
    public ResponseEntity<Map<String, Object>> handleTransientAi(TransientAiException ex) {
        log.warn("Error transitorio del proveedor LLM", ex);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(errorBody(HttpStatus.SERVICE_UNAVAILABLE,
                        "El servicio IA no está disponible en este momento. Reintente en unos segundos."));
    }

    /**
     * Errores de red al contactar con el MCP server (servicio caído, DNS, timeout).
     */
    @ExceptionHandler(WebClientRequestException.class)
    public ResponseEntity<Map<String, Object>> handleMcpUnavailable(WebClientRequestException ex) {
        log.error("No se pudo contactar con el servidor MCP", ex);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(errorBody(HttpStatus.SERVICE_UNAVAILABLE,
                        "El servidor de herramientas (MCP) no está disponible."));
    }

    /**
     * Estado inconsistente detectado en la capa de servicio (p.ej. respuesta del LLM nula).
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        log.error("Estado ilegal durante el autodiagnóstico", ex);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(errorBody(HttpStatus.BAD_GATEWAY, ex.getMessage()));
    }

    private Map<String, Object> errorBody(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return body;
    }
}
