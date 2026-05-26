package es.ual.dra.autodiagnostico.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import es.ual.dra.autodiagnostico.model.entitity.core.Vehicle;

/**
 * Repositorio para la gestión de la persistencia de la entidad Vehicle.
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByNameAndBrand(String name, String brand);

    @Query("SELECT DISTINCT v.brand FROM Vehicle v WHERE v.brand IS NOT NULL AND v.brand <> '' ORDER BY v.brand")
    List<String> findDistinctBrandsOrdered();

    List<Vehicle> findByBrandIgnoreCaseOrderByNameAsc(String brand);
}
