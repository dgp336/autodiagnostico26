package es.ual.dra.autodiagnostico.dto;

import java.time.LocalDateTime;

public record ContactMessageDTO(
    Long id,
    String name,
    String email,
    String phone,
    String message,
    Long workshopId,
    LocalDateTime createdAt,
    LocalDateTime repliedAt,
    String replyMessage
) {}
