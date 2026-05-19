package es.ual.dra.autodiagnostico.service.core;

import es.ual.dra.autodiagnostico.model.entitity.core.Engine;
import es.ual.dra.autodiagnostico.model.entitity.core.EngineType;
import es.ual.dra.autodiagnostico.model.entitity.core.TransmissionType;
import es.ual.dra.autodiagnostico.model.entitity.core.Vehicle;
import es.ual.dra.autodiagnostico.model.entitity.core.VehicleModel;
import es.ual.dra.autodiagnostico.repository.EngineRepository;
import es.ual.dra.autodiagnostico.repository.VehicleModelRepository;
import es.ual.dra.autodiagnostico.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Inicializador TEMPORAL que crea unos pocos vehículos de prueba en la BD si
 * está vacía, para poder probar el flujo de autodiagnóstico sin depender del
 * scraper de UltimateSpecs.
 *
 * <p><b>REVERTIR DESPUÉS DE LA PRIMERA EJECUCIÓN</b>: cuando ya haya vehículos
 * persistidos en MySQL (o cuando arranques el scraper), basta con:
 * <ul>
 *   <li>Borrar este fichero, o</li>
 *   <li>Añadir {@code app.seed.vehicles.enabled=false} en application.properties.</li>
 * </ul>
 *
 * <p>Por defecto el seed está habilitado. Es idempotente: si ya hay registros
 * en la tabla {@code vehicle}, no hace nada.
 */
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.vehicles.enabled", havingValue = "true", matchIfMissing = true)
@Order(1)
@Slf4j
public class VehiclesSeedInitializer implements ApplicationRunner {

    private final VehicleRepository vehicleRepository;
    private final VehicleModelRepository vehicleModelRepository;
    private final EngineRepository engineRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (vehicleRepository.count() > 0) {
            log.info("Tabla vehicle ya tiene datos, se omite el seed de vehículos.");
            return;
        }

        log.info("Sembrando vehículos de prueba (un modelo por motorización)…");

        Engine ePetrol = saveEngine("1.5 TSI", EngineType.PETROL);
        Engine eDiesel = saveEngine("2.0 TDI", EngineType.DIESEL);
        Engine eBev    = saveEngine("Permanent Magnet AC", EngineType.BEV);
        Engine eHev    = saveEngine("1.8 Hybrid", EngineType.HEV);
        Engine ePhev   = saveEngine("1.4 e-Hybrid", EngineType.PHEV);
        Engine eReev   = saveEngine("Range Extender 1.5", EngineType.REEV);

        seed("Volkswagen", "Golf",     "Golf 1.5 TSI 130 CV", 2020, TransmissionType.MT,  ePetrol);
        seed("Audi",       "A4",       "A4 2.0 TDI 150 CV",   2018, TransmissionType.AT,  eDiesel);
        seed("Tesla",      "Model 3",  "Model 3 Standard",    2023, TransmissionType.AT,  eBev);
        seed("Toyota",     "Corolla",  "Corolla Hybrid 1.8",  2022, TransmissionType.eCVT, eHev);
        seed("Volkswagen", "Passat",   "Passat GTE 1.4",      2021, TransmissionType.DCT, ePhev);
        seed("BMW",        "i3",       "i3 REx",              2019, TransmissionType.AT,  eReev);

        log.info("Seed completado: {} vehículos, {} modelos.",
                vehicleRepository.count(), vehicleModelRepository.count());
    }

    private Engine saveEngine(String name, EngineType type) {
        return engineRepository.findByNameAndEngineType(name, type)
                .orElseGet(() -> engineRepository.save(
                        Engine.builder().name(name).engineType(type).build()));
    }

    private void seed(String brand, String name, String variantName, int year,
                      TransmissionType transmission, Engine engine) {
        Vehicle vehicle = Vehicle.builder()
                .brand(brand)
                .name(name)
                .vehicleModels(new java.util.ArrayList<>())
                .build();
        vehicle = vehicleRepository.save(vehicle);

        VehicleModel vm = VehicleModel.builder()
                .vehicle(vehicle)
                .modelName(variantName)
                .yearFirstProduction(year)
                .transmission(transmission)
                .engine(engine)
                .personalVehicles(new java.util.ArrayList<>())
                .build();
        vehicleModelRepository.save(vm);
    }
}
