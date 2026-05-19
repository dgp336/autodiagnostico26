package es.ual.dra.autodiagnostico.repository.chat;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import es.ual.dra.autodiagnostico.model.entitity.chat.ChatMessage;
import es.ual.dra.autodiagnostico.model.entitity.chat.ChatSenderRole;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    boolean existsByIssueId(Long issueId);

    List<ChatMessage> findTop100ByIssueIdOrderByCreatedAtDesc(Long issueId);

    List<ChatMessage> findTop100ByIssueIdAndIdGreaterThanOrderByIdAsc(Long issueId, Long id);

    long countByIssueIdAndSenderRoleAndReadByUserFalse(Long issueId, ChatSenderRole senderRole);

    @Modifying
    @Query("update ChatMessage m set m.readByUser = true where m.issue.id = :issueId and m.senderRole = :senderRole and m.readByUser = false")
    int markReadByUserAndIssue(@Param("issueId") Long issueId, @Param("senderRole") ChatSenderRole senderRole);
}
