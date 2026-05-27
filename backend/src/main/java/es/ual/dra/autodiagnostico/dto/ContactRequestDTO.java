package es.ual.dra.autodiagnostico.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ContactRequestDTO(
    @NotBlank String name,
    @NotBlank @Email String email,
    String phone,
    @NotBlank String message,
    Long workshopId
) {}
