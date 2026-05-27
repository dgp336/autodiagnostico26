package es.ual.dra.autodiagnostico.repository;

import es.ual.dra.autodiagnostico.model.entitity.contact.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    List<ContactMessage> findAllByOrderByCreatedAtDesc();
}
