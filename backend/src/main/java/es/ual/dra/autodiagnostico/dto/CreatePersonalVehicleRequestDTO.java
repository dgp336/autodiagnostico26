package es.ual.dra.autodiagnostico.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
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
public class CreatePersonalVehicleRequestDTO {

    @NotNull(message = "El propietario es obligatorio")
    private Long ownerId;

    @NotNull(message = "El modelo de vehículo es obligatorio")
    private Long vehicleModelId;

    private String plate;
    private String vin;
    private LocalDate buildDate;
}
