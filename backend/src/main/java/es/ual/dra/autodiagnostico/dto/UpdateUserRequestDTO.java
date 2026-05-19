package es.ual.dra.autodiagnostico.dto;

import jakarta.validation.constraints.Pattern;
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
public class UpdateUserRequestDTO {

    @Size(max = 150, message = "El nombre completo excede el tamano permitido")
    private String fullName;

    @Pattern(regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "El correo no tiene un formato valido")
    @Size(max = 180, message = "El correo excede el tamano permitido")
    private String email;

    @Size(max = 150, message = "La ciudad excede el tamano permitido")
    private String city;

    @Pattern(regexp = "^\\d{5}$|^$", message = "El codigo postal debe tener exactamente 5 digitos")
    private String postalCode;
}
