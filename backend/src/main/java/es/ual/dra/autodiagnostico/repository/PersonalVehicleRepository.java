package es.ual.dra.autodiagnostico.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import es.ual.dra.autodiagnostico.model.entitity.core.PersonalVehicle;

@Repository
public interface PersonalVehicleRepository extends JpaRepository<PersonalVehicle, Long> {

    List<PersonalVehicle> findByOwnerIdOrderByIdDesc(Long ownerId);
}
