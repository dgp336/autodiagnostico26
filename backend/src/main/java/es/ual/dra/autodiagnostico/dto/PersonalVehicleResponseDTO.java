package es.ual.dra.autodiagnostico.dto;

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
    private Long vehicleId;

    private String brand;
    private String vehicleName;
    private String modelName;
    private Integer firstProductionYear;
    private String engineType;
    private String transmission;

    private String plate;
    private String vin;
}
