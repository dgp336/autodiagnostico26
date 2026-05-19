package es.ual.dra.autodiagnostico.dto;

import java.time.LocalDate;

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
public class PersonalVehicleResponseDTO {

    private Long id;
    private Long ownerId;
    private Long vehicleModelId;

    private String brand;
    private String vehicleName;
    private String modelName;
    private Integer year;
    private String engineType;
    private String transmission;

    private String plate;
    private String vin;
    private LocalDate buildDate;
}
