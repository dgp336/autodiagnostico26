package es.ual.dra.autodiagnostico.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import es.ual.dra.autodiagnostico.dto.ChatJoinResponseDTO;
import es.ual.dra.autodiagnostico.dto.ChatMessageRequestDTO;
import es.ual.dra.autodiagnostico.dto.ChatMessageResponseDTO;
import es.ual.dra.autodiagnostico.service.chat.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/join")
    public ResponseEntity<ChatJoinResponseDTO> joinRoom(
            @RequestParam String sessionUuid,
            @RequestParam Long participantId) {
        return ResponseEntity.ok(chatService.joinRoom(sessionUuid, participantId));
    }

    @PostMapping("/leave")
    public ResponseEntity<ChatJoinResponseDTO> leaveRoom(
            @RequestParam String sessionUuid,
            @RequestParam Long participantId) {
        return ResponseEntity.ok(chatService.leaveRoom(sessionUuid, participantId));
    }

    @GetMapping("/mensajes")
    public ResponseEntity<List<ChatMessageResponseDTO>> listMessages(
            @RequestParam String sessionUuid,
            @RequestParam(defaultValue = "50") Integer limit,
            @RequestParam(required = false) Long afterId) {
        return ResponseEntity.ok(chatService.listMessages(sessionUuid, limit, afterId));
    }

    @PostMapping("/mensajes")
    public ResponseEntity<ChatMessageResponseDTO> sendMessage(@Valid @RequestBody ChatMessageRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.sendMessage(dto));
    }

    @GetMapping("/unread")
    public ResponseEntity<Long> unreadCount(@RequestParam String sessionUuid) {
        return ResponseEntity.ok(chatService.unreadCount(sessionUuid));
    }

    @PostMapping("/mark-read")
    public ResponseEntity<Integer> markReadByUser(@RequestParam String sessionUuid) {
        return ResponseEntity.ok(chatService.markReadByUser(sessionUuid));
    }

    @GetMapping("/presence")
    public ResponseEntity<Boolean> userPresence(
            @RequestParam String sessionUuid,
            @RequestParam Long participantId) {
        return ResponseEntity.ok(chatService.isUserOnline(sessionUuid, participantId));
    }
}
