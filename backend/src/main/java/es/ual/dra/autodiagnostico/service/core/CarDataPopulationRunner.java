package es.ual.dra.autodiagnostico.service.core;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import es.ual.dra.autodiagnostico.repository.EngineRepository;
import es.ual.dra.autodiagnostico.repository.VehicleModelRepository;
import es.ual.dra.autodiagnostico.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Profile("!test")
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class CarDataPopulationRunner implements ApplicationRunner {

    private final CarDataPopulationService service;
    private final VehicleRepository vehicleRepository;
    private final VehicleModelRepository vehicleModelRepository;
    private final EngineRepository engineRepository;

    @Override
    public void run(ApplicationArguments args) {

        try {

            long vehicleCount = vehicleRepository.count();
            long modelCount = vehicleModelRepository.count();
            long engineCount = engineRepository.count();

            if (vehicleCount + modelCount + engineCount > 0) {
                log.info("Database already populated (vehicles/models/engines)");
                return;
            }

            String rootPath = args.containsOption("rootPath")
                    ? args.getOptionValues("rootPath").get(0)
                    : (new java.io.File("src/main/resources/scraper-output/Groups").exists()
                            ? "src/main/resources/scraper-output/Groups"
                            : "scraper-output/Groups");

            service.scanAndPopulate(rootPath);

        } catch (Exception e) {
            log.error("Fatal population error", e);
        }
    }
}
