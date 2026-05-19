package es.ual.dra.autodiagnostico.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import es.ual.dra.autodiagnostico.model.entitity.core.Workshop;

@Repository
public interface WorkshopRepository extends JpaRepository<Workshop, Long> {

    Optional<Workshop> findByNameIgnoreCase(String name);
}
