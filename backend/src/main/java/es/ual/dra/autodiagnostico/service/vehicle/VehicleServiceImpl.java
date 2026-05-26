package es.ual.dra.autodiagnostico.service.vehicle;

import es.ual.dra.autodiagnostico.dto.VehicleModelSummaryDTO;
import es.ual.dra.autodiagnostico.dto.VehicleVariantDTO;
import es.ual.dra.autodiagnostico.model.entitity.core.EngineType;
import es.ual.dra.autodiagnostico.model.entitity.core.VehicleModel;
import es.ual.dra.autodiagnostico.repository.VehicleModelRepository;
import es.ual.dra.autodiagnostico.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleModelRepository vehicleModelRepository;

    @Override
    public List<String> getBrands() {
        return vehicleRepository.findDistinctBrandsOrdered();
    }

    @Override
    public List<VehicleModelSummaryDTO> getModelsByBrand(String brand) {
        return vehicleRepository.findByBrandIgnoreCaseOrderByNameAsc(brand).stream()
                .map(v -> new VehicleModelSummaryDTO(v.getIdVehicle(), v.getName()))
                .toList();
    }

    @Override
    public List<VehicleVariantDTO> getVariantsByVehicleId(Long vehicleId) {
        return vehicleModelRepository.findByVehicle_IdVehicleOrderByModelNameAsc(vehicleId).stream()
                .map(this::toVariantDTO)
                .toList();
    }

    private VehicleVariantDTO toVariantDTO(VehicleModel vm) {
        String engineName = null;
        EngineType engineType = null;
        if (vm.getEngine() != null) {
            engineName = vm.getEngine().getName();
            engineType = vm.getEngine().getEngineType();
        }
        return new VehicleVariantDTO(
                vm.getIdVehicleModel(),
                vm.getModelName(),
                vm.getTransmission(),
                engineName,
                engineType);
    }
}
