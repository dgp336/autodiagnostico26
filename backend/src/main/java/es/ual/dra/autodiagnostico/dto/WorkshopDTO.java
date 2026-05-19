package es.ual.dra.autodiagnostico.dto;

import java.util.List;

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
public class WorkshopDTO {

    private Long id;

    private String name;

    private String address;

    private String phone;

    private String email;

    private String schedule;

    private String photoUrl;

    private int vehicleLimit;

    private long activeVehicles;

    private Long mechanicId;

    private String mechanicName;

    private String mechanicAvatar;

    private double latitude;

    private double longitude;

    private boolean selectedByClient;

    private String sessionUuid;

    private List<RepairVehicleMockDTO> vehiclesInRepair;
}
