package es.ual.dra.autodiagnostico.model.entitity.contact;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contact_message")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    private Long workshopId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime repliedAt;

    @Column(columnDefinition = "TEXT")
    private String replyMessage;
}
