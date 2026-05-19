package es.ual.dra.autodiagnostico.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import es.ual.dra.autodiagnostico.model.entitity.core.Issue;
import es.ual.dra.autodiagnostico.model.entitity.core.IssueStatus;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    Optional<Issue> findBySessionUuid(String sessionUuid);

    List<Issue> findByPersonalVehicleOwnerIdAndPersonalVehicleIdAndActiveTrue(Long ownerId, Long personalVehicleId);

    Optional<Issue> findFirstByPersonalVehicleOwnerIdAndPersonalVehicleIdAndStatusAndActiveTrueOrderByCreatedAtDesc(
        Long ownerId,
        Long personalVehicleId,
        IssueStatus status);

    List<Issue> findByWorkshopMechanicIdAndActiveTrue(Long mechanicId);

    Optional<Issue> findByWorkshopMechanicIdAndPersonalVehicleOwnerIdAndPersonalVehicleIdAndActiveTrue(
        Long mechanicId,
        Long ownerId,
        Long personalVehicleId);

    List<Issue> findByPersonalVehicleOwnerIdAndActiveTrue(Long ownerId);

    Optional<Issue> findFirstByPersonalVehicleOwnerIdAndActiveTrue(Long ownerId);

    Optional<Issue> findByWorkshopMechanicIdAndPersonalVehicleOwnerIdAndActiveTrue(Long mechanicId, Long ownerId);

    long countByWorkshopMechanicIdAndActiveTrue(Long mechanicId);
}
