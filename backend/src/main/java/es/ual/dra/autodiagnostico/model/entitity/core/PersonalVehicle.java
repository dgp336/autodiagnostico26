package es.ual.dra.autodiagnostico.model.entitity.core;

import java.time.LocalDate;

import es.ual.dra.autodiagnostico.model.entitity.user.AppUser;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "personal_vehicle")
@Getter
@Setter
@ToString(exclude = "owner")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalVehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idVehicleModel")
    private VehicleModel vehicleModel;

    @ManyToOne(optional = true)
    @JoinColumn(name = "owner_id")
    private AppUser owner;

    private LocalDate buildDate;

    @Column(name = "vin", length = 32)
    private String vin;

    @Column(length = 16)
    private String plate;
}
