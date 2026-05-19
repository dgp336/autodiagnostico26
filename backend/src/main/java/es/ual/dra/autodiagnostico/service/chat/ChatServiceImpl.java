package es.ual.dra.autodiagnostico.service.chat;

import java.util.Comparator;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.ual.dra.autodiagnostico.dto.ChatJoinResponseDTO;
import es.ual.dra.autodiagnostico.dto.ChatMessageRequestDTO;
import es.ual.dra.autodiagnostico.dto.ChatMessageResponseDTO;
import es.ual.dra.autodiagnostico.model.entitity.chat.ChatMessage;
import es.ual.dra.autodiagnostico.model.entitity.chat.ChatRoomPresence;
import es.ual.dra.autodiagnostico.model.entitity.chat.ChatSenderRole;
import es.ual.dra.autodiagnostico.model.entitity.core.Issue;
import es.ual.dra.autodiagnostico.model.entitity.user.AppUser;
import es.ual.dra.autodiagnostico.repository.IssueRepository;
import es.ual.dra.autodiagnostico.repository.UserRepository;
import es.ual.dra.autodiagnostico.repository.chat.ChatMessageRepository;
import es.ual.dra.autodiagnostico.repository.chat.ChatRoomPresenceRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatServiceImpl implements ChatService {

    private static final int MAX_USERS_PER_ROOM = 10;
    private static final int MAX_WORDS_PER_MESSAGE = 500;
    private static final int MAX_FETCH_LIMIT = 100;
    private static final Pattern WHITESPACE_PATTERN = Pattern.compile("\\s+");

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomPresenceRepository chatRoomPresenceRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;

    @Override
    public ChatJoinResponseDTO joinRoom(String sessionUuid, Long participantId) {
        Issue issue = resolveIssue(sessionUuid);
        AppUser participant = resolveParticipant(participantId);

        ChatRoomPresence presence = chatRoomPresenceRepository
                .findByIssueIdAndParticipantId(issue.getId(), participant.getId())
                .orElse(null);

        if (presence == null || !presence.isActive()) {
            long currentActive = chatRoomPresenceRepository.countByIssueIdAndActiveIsTrue(issue.getId());
            if (currentActive >= MAX_USERS_PER_ROOM) {
                throw new IllegalArgumentException("La sala esta llena. Maximo 10 personas por chat");
            }

            if (presence == null) {
                presence = ChatRoomPresence.builder()
                        .issue(issue)
                        .participant(participant)
                        .active(true)
                        .build();
            } else {
                presence.setActive(true);
            }

            chatRoomPresenceRepository.save(presence);
        }

        int activeUsers = (int) chatRoomPresenceRepository.countByIssueIdAndActiveIsTrue(issue.getId());
        return ChatJoinResponseDTO.builder()
                .sessionUuid(issue.getSessionUuid())
                .participantId(participant.getId())
                .activeUsers(activeUsers)
                .maxUsers(MAX_USERS_PER_ROOM)
                .joined(true)
                .build();
    }

    @Override
    public ChatJoinResponseDTO leaveRoom(String sessionUuid, Long participantId) {
        Issue issue = resolveIssue(sessionUuid);
        AppUser participant = resolveParticipant(participantId);

        chatRoomPresenceRepository.findByIssueIdAndParticipantId(issue.getId(), participant.getId())
                .ifPresent(presence -> {
                    presence.setActive(false);
                    chatRoomPresenceRepository.save(presence);
                });

        int activeUsers = (int) chatRoomPresenceRepository.countByIssueIdAndActiveIsTrue(issue.getId());
        return ChatJoinResponseDTO.builder()
                .sessionUuid(issue.getSessionUuid())
                .participantId(participant.getId())
                .activeUsers(activeUsers)
                .maxUsers(MAX_USERS_PER_ROOM)
                .joined(false)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponseDTO> listMessages(String sessionUuid, Integer limit, Long afterId) {
        Issue issue = resolveIssue(sessionUuid);
        int safeLimit = limit == null ? 50 : Math.max(1, Math.min(limit, MAX_FETCH_LIMIT));

        List<ChatMessage> result;
        if (afterId != null && afterId > 0) {
            result = chatMessageRepository
                    .findTop100ByIssueIdAndIdGreaterThanOrderByIdAsc(issue.getId(), afterId)
                    .stream()
                    .limit(safeLimit)
                    .toList();
        } else {
            List<ChatMessage> ordered = chatMessageRepository
                    .findTop100ByIssueIdOrderByCreatedAtDesc(issue.getId())
                    .stream()
                    .sorted(Comparator.comparing(ChatMessage::getCreatedAt))
                    .toList();
            int start = Math.max(0, ordered.size() - safeLimit);
            result = ordered.subList(start, ordered.size());
        }

        return result.stream().map(this::toDTO).toList();
    }

    @Override
    public ChatMessageResponseDTO sendMessage(ChatMessageRequestDTO dto) {
        Issue issue = resolveIssue(dto.getSessionUuid());
        AppUser participant = resolveParticipant(dto.getParticipantId());
        ChatSenderRole senderRole = ChatSenderRole.from(dto.getSenderRole());

        String normalizedSessionUuid = issue.getSessionUuid() == null ? "" : issue.getSessionUuid().trim();
        if (normalizedSessionUuid.isEmpty()) {
            throw new IllegalArgumentException("El expediente no tiene UUID de sesion asignado");
        }
        if (!normalizedSessionUuid.equals(dto.getSessionUuid().trim())) {
            throw new IllegalArgumentException("La sesion del mensaje no coincide con el expediente");
        }

        ensureParticipantInRoom(issue.getId(), participant.getId());

        if (!chatMessageRepository.existsByIssueId(issue.getId()) && senderRole != ChatSenderRole.MECANICO) {
            throw new IllegalArgumentException("El primer mensaje de la conversacion debe enviarlo el mecanico");
        }

        String normalizedComment = normalizeComment(dto.getCommentText());
        int wordCount = countWords(normalizedComment);

        if (wordCount == 0) {
            throw new IllegalArgumentException("El comentario no puede estar vacio");
        }
        if (wordCount > MAX_WORDS_PER_MESSAGE) {
            throw new IllegalArgumentException("El comentario excede 500 palabras");
        }

        ChatMessage saved = chatMessageRepository.save(
                ChatMessage.builder()
                        .issue(issue)
                    .sessionUuid(normalizedSessionUuid)
                        .sender(participant)
                        .senderRole(senderRole)
                        .commentText(normalizedComment)
                        .wordCount(wordCount)
                        .readByUser(senderRole == ChatSenderRole.USUARIO)
                        .build());

        return toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public long unreadCount(String sessionUuid) {
        Issue issue = resolveIssue(sessionUuid);
        return chatMessageRepository.countByIssueIdAndSenderRoleAndReadByUserFalse(issue.getId(),
                ChatSenderRole.MECANICO);
    }

    @Override
    public int markReadByUser(String sessionUuid) {
        Issue issue = resolveIssue(sessionUuid);
        return chatMessageRepository.markReadByUserAndIssue(issue.getId(), ChatSenderRole.MECANICO);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUserOnline(String sessionUuid, Long participantId) {
        Issue issue = resolveIssue(sessionUuid);
        AppUser participant = resolveParticipant(participantId);
        return chatRoomPresenceRepository.findByIssueIdAndParticipantId(issue.getId(), participant.getId())
                .map(ChatRoomPresence::isActive)
                .orElse(false);
    }

    private Issue resolveIssue(String sessionUuid) {
        String normalized = sessionUuid == null ? "" : sessionUuid.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("El UUID de sesion es obligatorio");
        }
        return issueRepository.findBySessionUuid(normalized)
                .orElseThrow(() -> new IllegalArgumentException("No existe un expediente con ese UUID"));
    }

    private AppUser resolveParticipant(Long participantId) {
        if (participantId == null || participantId <= 0) {
            throw new IllegalArgumentException("El participante es obligatorio");
        }
        return userRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Participante no encontrado"));
    }

    private void ensureParticipantInRoom(Long issueId, Long participantId) {
        ChatRoomPresence presence = chatRoomPresenceRepository
                .findByIssueIdAndParticipantId(issueId, participantId)
                .orElseThrow(() -> new IllegalArgumentException("Debes unirte a la sala antes de enviar mensajes"));

        if (!presence.isActive()) {
            throw new IllegalArgumentException("Debes unirte a la sala antes de enviar mensajes");
        }
    }

    private String normalizeComment(String value) {
        return value == null ? "" : value.trim();
    }

    private int countWords(String text) {
        String trimmed = text == null ? "" : text.trim();
        if (trimmed.isEmpty()) {
            return 0;
        }
        return WHITESPACE_PATTERN.split(trimmed).length;
    }

    private ChatMessageResponseDTO toDTO(ChatMessage message) {
        return ChatMessageResponseDTO.builder()
                .id(message.getId())
                .participantId(message.getSender() == null ? null : message.getSender().getId())
                .sessionUuid(message.getIssue().getSessionUuid())
                .senderRole(message.getSenderRole().name())
                .commentText(message.getCommentText())
                .wordCount(message.getWordCount())
                .readByUser(message.isReadByUser())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
