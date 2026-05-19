package es.ual.dra.autodiagnostico.model.entitity.chat;

import java.time.LocalDateTime;

import es.ual.dra.autodiagnostico.model.entitity.core.Issue;
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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "chat_message")
@Getter
@Setter
@ToString(exclude = { "issue", "sender" })
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private AppUser sender;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_role", nullable = false, length = 20)
    private ChatSenderRole senderRole;
    
  /**
     * UUID de la sesión/asignación
     * Para USUARIO: su propio UUID
     * Para TALLER: el UUID de la asignación con este cliente
     */
    @Column(name = "session_uuid", nullable = false, length = 36)
    private String sessionUuid;

    @Column(name = "comment_text", nullable = false, length = 6000)
    private String commentText;

    @Column(name = "word_count", nullable = false)
    private Integer wordCount;

    @Column(name = "read_by_user", nullable = false)
    private boolean readByUser;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
