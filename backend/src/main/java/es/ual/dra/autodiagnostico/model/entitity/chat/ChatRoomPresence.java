package es.ual.dra.autodiagnostico.model.entitity.chat;

import java.time.LocalDateTime;

import es.ual.dra.autodiagnostico.model.entitity.core.Issue;
import es.ual.dra.autodiagnostico.model.entitity.user.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(
        name = "chat_room_presence",
        uniqueConstraints = {
            @UniqueConstraint(name = "uk_chat_issue_participant", columnNames = {"issue_id", "participant_id"})
        }
)
@Getter
@Setter
@ToString(exclude = { "issue", "participant" })
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomPresence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @ManyToOne(optional = false)
    @JoinColumn(name = "participant_id", nullable = false)
    private AppUser participant;

    @Column(name = "active", nullable = false)
    private boolean active;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        joinedAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
