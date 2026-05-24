package es.ual.dra.autodiagnostico.dto;

import java.time.LocalDateTime;

import es.ual.dra.autodiagnostico.model.entitity.core.WorkshopApplicationStatus;
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
public class WorkshopApplicationResponseDTO {

    private Long id;
    private String fullName;
    private String email;
    private String workshopName;
    private String address;
    private String phone;
    private String schedule;
    private String photoUrl;
    private int vehicleLimit;
    private double latitude;
    private double longitude;
    private WorkshopApplicationStatus status;
    private Long approvedWorkshopId;
    private Long approvedMechanicId;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}