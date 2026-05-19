package es.ual.dra.autodiagnostico.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import es.ual.dra.autodiagnostico.dto.CreatePersonalVehicleRequestDTO;
import es.ual.dra.autodiagnostico.dto.PersonalVehicleResponseDTO;
import es.ual.dra.autodiagnostico.model.entitity.core.PersonalVehicle;
import es.ual.dra.autodiagnostico.model.entitity.core.Vehicle;
import es.ual.dra.autodiagnostico.model.entitity.core.VehicleModel;
import es.ual.dra.autodiagnostico.model.entitity.user.AppUser;
import es.ual.dra.autodiagnostico.repository.PersonalVehicleRepository;
import es.ual.dra.autodiagnostico.repository.UserRepository;
import es.ual.dra.autodiagnostico.repository.VehicleModelRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PersonalVehicleService {

    private final PersonalVehicleRepository personalVehicleRepository;
    private final VehicleModelRepository vehicleModelRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<PersonalVehicleResponseDTO> listByOwner(Long ownerId) {
        if (ownerId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ownerId es obligatorio");
        }
        return personalVehicleRepository.findByOwnerIdOrderByIdDesc(ownerId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public PersonalVehicleResponseDTO getById(Long id) {
        PersonalVehicle pv = personalVehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehículo no encontrado"));
        return toDto(pv);
    }

    @Transactional
    public PersonalVehicleResponseDTO create(CreatePersonalVehicleRequestDTO request) {
        AppUser owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        VehicleModel model = vehicleModelRepository.findById(request.getVehicleModelId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variante no encontrada"));

        PersonalVehicle pv = PersonalVehicle.builder()
                .owner(owner)
                .vehicleModel(model)
                .plate(normalize(request.getPlate()))
                .vin(normalize(request.getVin()))
                .buildDate(request.getBuildDate())
                .build();

        return toDto(personalVehicleRepository.save(pv));
    }

    @Transactional
    public void delete(Long id, Long ownerId) {
        PersonalVehicle pv = personalVehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehículo no encontrado"));
        if (pv.getOwner() == null || !pv.getOwner().getId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El vehículo no pertenece al usuario");
        }
        personalVehicleRepository.delete(pv);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private PersonalVehicleResponseDTO toDto(PersonalVehicle pv) {
        VehicleModel model = pv.getVehicleModel();
        Vehicle vehicle = model == null ? null : model.getVehicle();
        return PersonalVehicleResponseDTO.builder()
                .id(pv.getId())
                .ownerId(pv.getOwner() == null ? null : pv.getOwner().getId())
                .vehicleModelId(model == null ? null : model.getIdVehicleModel())
                .brand(vehicle == null ? null : vehicle.getBrand())
                .vehicleName(vehicle == null ? null : vehicle.getName())
                .modelName(model == null ? null : model.getModelName())
                .year(model == null ? null : model.getYearFirstProduction())
                .engineType(model == null || model.getEngine() == null || model.getEngine().getEngineType() == null
                        ? null
                        : model.getEngine().getEngineType().name())
                .transmission(model == null || model.getTransmission() == null ? null : model.getTransmission().name())
                .plate(pv.getPlate())
                .vin(pv.getVin())
                .buildDate(pv.getBuildDate())
                .build();
    }
}
