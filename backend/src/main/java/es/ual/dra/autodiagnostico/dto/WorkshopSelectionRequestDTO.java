package es.ual.dra.autodiagnostico.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkshopSelectionRequestDTO {

    private Long clientId;
    private Long personalVehicleId;
    private String description;
}
