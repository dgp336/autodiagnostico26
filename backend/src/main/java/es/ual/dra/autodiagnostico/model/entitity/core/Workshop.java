package es.ual.dra.autodiagnostico.model.entitity.core;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "workshop")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workshop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 160)
    private String name;

    @Column(nullable = false, length = 240)
    private String address;

    @Column(nullable = false, length = 40)
    private String phone;

    @Column(nullable = false, length = 180)
    private String email;

    @Column(nullable = false, length = 160)
    private String schedule;

    @Column(name = "photo_url", nullable = false, length = 300)
    private String photoUrl;

    @Column(name = "vehicle_limit", nullable = false)
    private int vehicleLimit;

    @Column(name = "mechanic_id", nullable = false)
    private Long mechanicId;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;
}
