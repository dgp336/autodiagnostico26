package es.ual.dra.autodiagnosticomcp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CandidatePartsTool {

    private static final Logger log = LoggerFactory.getLogger(CandidatePartsTool.class);

    private final PartsCatalogService catalog;

    public CandidatePartsTool(PartsCatalogService catalog) {
        this.catalog = catalog;
    }

    @Tool(description =
            "Devuelve la lista de piezas candidatas para una motorización dada. " +
            "El LLM DEBE elegir nombres EXACTAMENTE iguales a los devueltos por esta tool; " +
            "cualquier otro nombre será descartado por el backend.")
    public List<PartsCatalogEntry> get_candidate_parts(
            @ToolParam(description = "Tipo de motor: PETROL, DIESEL, BEV, HEV, PHEV, REEV")
            String engineType) {

        log.info("[MCP Tool] get_candidate_parts(engineType={})", engineType);

        EngineType type;
        try {
            type = EngineType.valueOf(engineType);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "engineType inválido: " + engineType
                            + ". Valores permitidos: PETROL, DIESEL, BEV, HEV, PHEV, REEV.");
        }
        return catalog.candidatesFor(type);
    }
}
