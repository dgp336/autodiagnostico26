package es.ual.dra.autodiagnostico.dto;

import jakarta.validation.constraints.NotBlank;

public record ReplyRequestDTO(
    @NotBlank String message
) {}
