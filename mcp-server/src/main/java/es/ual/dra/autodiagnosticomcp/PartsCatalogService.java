package es.ual.dra.autodiagnosticomcp;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Carga al arranque los catálogos JSON por motorización desde
 * `classpath:parts-catalog/{ENGINE_TYPE}.json`. Cada archivo es un array
 * plano `[{name, description, priceRange}, ...]` (mismo formato que los
 * `general-car-parts-*.json` originales del backend).
 */
@Service
public class PartsCatalogService {

    private static final Logger log = LoggerFactory.getLogger(PartsCatalogService.class);

    private final ResourceLoader loader;
    private final ObjectMapper mapper;
    private final Map<EngineType, List<PartsCatalogEntry>> catalog = new EnumMap<>(EngineType.class);

    public PartsCatalogService(ResourceLoader loader, ObjectMapper mapper) {
        this.loader = loader;
        this.mapper = mapper;
    }

    @PostConstruct
    void load() throws IOException {
        for (EngineType type : EngineType.values()) {
            String path = "classpath:parts-catalog/" + type.name() + ".json";
            Resource resource = loader.getResource(path);
            if (!resource.exists()) {
                log.warn("Catálogo no encontrado para {}: {}", type, path);
                catalog.put(type, List.of());
                continue;
            }
            List<PartsCatalogEntry> entries = mapper.readValue(
                    resource.getInputStream(),
                    new TypeReference<List<PartsCatalogEntry>>() {});
            catalog.put(type, entries);
            log.info("Cargadas {} piezas para motorización {}", entries.size(), type);
        }
    }

    public List<PartsCatalogEntry> candidatesFor(EngineType type) {
        return catalog.getOrDefault(type, List.of());
    }
}
