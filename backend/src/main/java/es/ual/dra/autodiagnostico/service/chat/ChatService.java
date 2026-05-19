package es.ual.dra.autodiagnostico.service.chat;

import java.util.List;

import es.ual.dra.autodiagnostico.dto.ChatJoinResponseDTO;
import es.ual.dra.autodiagnostico.dto.ChatMessageRequestDTO;
import es.ual.dra.autodiagnostico.dto.ChatMessageResponseDTO;

public interface ChatService {

    ChatJoinResponseDTO joinRoom(String sessionUuid, Long participantId);

    ChatJoinResponseDTO leaveRoom(String sessionUuid, Long participantId);

    List<ChatMessageResponseDTO> listMessages(String sessionUuid, Integer limit, Long afterId);

    ChatMessageResponseDTO sendMessage(ChatMessageRequestDTO dto);

    long unreadCount(String sessionUuid);

    int markReadByUser(String sessionUuid);

    boolean isUserOnline(String sessionUuid, Long participantId);
}
