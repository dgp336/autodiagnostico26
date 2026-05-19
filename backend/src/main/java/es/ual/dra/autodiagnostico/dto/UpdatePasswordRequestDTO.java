package es.ual.dra.autodiagnostico.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePasswordRequestDTO {

    @NotBlank(message = "La contrasena actual es obligatoria")
    private String currentPassword;

    @NotBlank(message = "La nueva contrasena es obligatoria")
    @Size(min = 6, max = 72, message = "La contrasena debe tener entre 6 y 72 caracteres")
    private String newPassword;
}
