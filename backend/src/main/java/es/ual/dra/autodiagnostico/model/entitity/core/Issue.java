package es.ual.dra.autodiagnostico.model.entitity.core;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import es.ual.dra.autodiagnostico.model.entitity.user.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "issue", uniqueConstraints = {
        @UniqueConstraint(name = "uk_issue_session_uuid", columnNames = { "session_uuid" })
})
@Getter
@Setter
@ToString(exclude = { "personalVehicle", "workshop" })
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "personal_vehicle_id", nullable = false)
    private PersonalVehicle personalVehicle;

    @ManyToOne(optional = true)
    @JoinColumn(name = "workshop_id")
    private Workshop workshop;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "ai_diagnosis", length = 1500)
    private String aiDiagnosis;

    @Column(name = "recommended_parts", length = 3000)
    private String recommendedParts;

    @Column(name = "estimated_price", precision = 12, scale = 2)
    private BigDecimal estimatedPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private IssueStatus status;

    @Column(name = "progress_color", length = 20)
    private String progressColor;

    @Column(name = "latest_update", length = 1500)
    private String latestUpdate;

    @Column(name = "budget_amount", precision = 12, scale = 2)
    private BigDecimal budgetAmount;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "active", nullable = false)
    private boolean active;

    @Column(name = "session_uuid", length = 36)
    private String sessionUuid;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public AppUser getClient() {
        return personalVehicle == null ? null : personalVehicle.getOwner();
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (status == null) {
            status = IssueStatus.DRAFT;
        }
        if (progressColor == null || progressColor.isBlank()) {
            progressColor = "amarillo";
        }
        if (!active) {
            active = true;
        }
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
