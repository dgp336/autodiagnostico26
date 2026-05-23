package es.ual.dra.autodiagnostico.model.entitity.core;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "workshop_application")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkshopApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "applicant_full_name", nullable = false, length = 150)
    private String applicantFullName;

    @Column(name = "applicant_email", nullable = false, length = 180)
    private String applicantEmail;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(name = "workshop_name", nullable = false, length = 160)
    private String workshopName;

    @Column(nullable = false, length = 240)
    private String address;

    @Column(nullable = false, length = 40)
    private String phone;

    @Column(nullable = false, length = 160)
    private String email;

    @Column(nullable = false, length = 160)
    private String schedule;

    @Column(name = "photo_url", length = 300)
    private String photoUrl;

    @Column(name = "vehicle_limit", nullable = false)
    private int vehicleLimit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkshopApplicationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_workshop_id")
    private Workshop approvedWorkshop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_mechanic_id")
    private es.ual.dra.autodiagnostico.model.entitity.user.AppUser approvedMechanic;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @PrePersist
    public void onCreate() {
        if (status == null) {
            status = WorkshopApplicationStatus.PENDING;
        }
        createdAt = LocalDateTime.now();
    }
}