package es.ual.dra.autodiagnostico.service.core;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import es.ual.dra.autodiagnostico.model.entitity.core.Product;
import es.ual.dra.autodiagnostico.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;

@Component
@RequiredArgsConstructor
@Slf4j
public class GeneralPartsInitializer implements ApplicationRunner {

    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        try {
            long count = productRepository.count();
            if (count > 0) {
                log.info("Products already exist (count={}), skipping general parts initialization", count);
                return;
            }

            InputStream is = getClass().getClassLoader().getResourceAsStream("static/general-car-parts.json");
            if (is == null) {
                is = getClass().getClassLoader().getResourceAsStream("general-car-parts.json");
            }
            if (is == null) {
                log.warn("general-car-parts.json not found on classpath");
                return;
            }

            JsonNode root = objectMapper.readTree(is);
            if (root != null && root.isArray()) {
                for (JsonNode node : root) {
                    String name = node.has("name") ? node.get("name").asText() : null;
                    String description = node.has("description") ? node.get("description").asText() : null;
                    String image = node.has("image") ? node.get("image").asText() : null;
                    Double min = null;
                    Double max = null;
                    if (node.has("priceRange")) {
                        String pr = node.get("priceRange").asText();
                        try {
                            String cleaned = pr.replaceAll("[^0-9\\-]", "");
                            if (cleaned.contains("-")) {
                                String[] parts = cleaned.split("-", 2);
                                min = Double.parseDouble(parts[0]);
                                max = Double.parseDouble(parts[1]);
                            } else {
                                min = Double.parseDouble(cleaned);
                                max = min;
                            }
                        } catch (Exception e) {
                            log.debug("Could not parse priceRange {} for {}: {}", pr, name, e.getMessage());
                        }
                    }

                    if (name != null) {
                        Product p = Product.builder()
                                .name(name.trim())
                                .description(description)
                                .lowRangePrice(min)
                                .highRangePrice(max)
                                .image(image)
                                .build();
                        productRepository.save(p);
                    }
                }
                log.info("Initialized {} general products", productRepository.count());
            }
        } catch (Exception e) {
            log.error("Error initializing general parts: {}", e.getMessage());
        }
    }
}
