package es.ual.dra.autodiagnostico.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import es.ual.dra.autodiagnostico.model.entitity.core.WorkshopApplication;
import es.ual.dra.autodiagnostico.model.entitity.core.WorkshopApplicationStatus;

public interface WorkshopApplicationRepository extends JpaRepository<WorkshopApplication, Long> {

    List<WorkshopApplication> findByStatusOrderByCreatedAtDesc(WorkshopApplicationStatus status);

    Optional<WorkshopApplication> findFirstByApplicantEmailIgnoreCaseAndStatus(String applicantEmail, WorkshopApplicationStatus status);

    boolean existsByApplicantEmailIgnoreCaseAndStatus(String applicantEmail, WorkshopApplicationStatus status);

    java.util.List<WorkshopApplication> findByApprovedWorkshopId(Long workshopId);
}