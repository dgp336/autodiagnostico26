package es.ual.dra.autodiagnostico.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import es.ual.dra.autodiagnostico.dto.autodiagnosis.DiagnosedPartDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MechanicClientDTO {

    private Long clientId;

    private String clientName;

    private String clientEmail;

    private String clientAvatar;

    private String carInfo;

    private String problemDescription;

    private String aiDiagnosis;

    private List<DiagnosedPartDTO> recommendedParts;

    private BigDecimal estimatedPrice;

    private LocalDateTime createdAt;

    private LocalDateTime acceptedAt;

    private LocalDateTime inProgressAt;

    private LocalDateTime fixedAt;

    private String status;

    private String latestUpdate;

    private String sessionUuid;

    private Long issueId;
}
