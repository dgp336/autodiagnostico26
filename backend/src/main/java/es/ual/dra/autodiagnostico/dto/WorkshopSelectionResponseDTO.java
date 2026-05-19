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
public class WorkshopSelectionResponseDTO {

    private WorkshopDTO workshop;

    private MechanicClientDTO tracking;
}
