package es.ual.dra.autodiagnostico.repository.chat;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import es.ual.dra.autodiagnostico.model.entitity.chat.ChatRoomPresence;

@Repository
public interface ChatRoomPresenceRepository extends JpaRepository<ChatRoomPresence, Long> {

    long countByIssueIdAndActiveIsTrue(Long issueId);

    Optional<ChatRoomPresence> findByIssueIdAndParticipantId(Long issueId, Long participantId);
}
