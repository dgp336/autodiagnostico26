package es.ual.dra.autodiagnostico.service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import es.ual.dra.autodiagnostico.model.entitity.chat.ChatMessage;
import es.ual.dra.autodiagnostico.model.entitity.chat.ChatRoomPresence;
import es.ual.dra.autodiagnostico.model.entitity.chat.ChatSenderRole;
import es.ual.dra.autodiagnostico.model.entitity.core.Issue;
import es.ual.dra.autodiagnostico.model.entitity.core.IssueStatus;
import es.ual.dra.autodiagnostico.model.entitity.core.PersonalVehicle;
import es.ual.dra.autodiagnostico.model.entitity.core.VehicleModel;
import es.ual.dra.autodiagnostico.model.entitity.core.Workshop;
import es.ual.dra.autodiagnostico.model.entitity.user.AppUser;
import es.ual.dra.autodiagnostico.model.entitity.user.UserRole;
import es.ual.dra.autodiagnostico.repository.IssueRepository;
import es.ual.dra.autodiagnostico.repository.PersonalVehicleRepository;
import es.ual.dra.autodiagnostico.repository.UserRepository;
import es.ual.dra.autodiagnostico.repository.VehicleModelRepository;
import es.ual.dra.autodiagnostico.repository.WorkshopRepository;
import es.ual.dra.autodiagnostico.repository.chat.ChatMessageRepository;
import es.ual.dra.autodiagnostico.repository.chat.ChatRoomPresenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Order(2)
@Slf4j
public class MechanicsDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WorkshopRepository workshopRepository;
    private final VehicleModelRepository vehicleModelRepository;
    private final PersonalVehicleRepository personalVehicleRepository;
    private final IssueRepository issueRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomPresenceRepository chatRoomPresenceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Initializing mechanics and clients data...");
        initializeMechanicsAndClients();
    }

    private void initializeMechanicsAndClients() {
        upsertUser(
                "admin@autodiagnostico.local",
                "admin",
                UserRole.ADMIN,
                "admin123!",
                "https://api.dicebear.com/9.x/initials/svg?seed=ADMIN&backgroundColor=1a6bbd");

        // Ensure mechanics exist (idempotent by email).
        List<AppUser> mechanics = new ArrayList<>();
        for (int i = 1; i <= 4; i++) {
            String email = "mecanico" + i + "@taller.local";
            upsertUser(
                    email,
                    mechanicName(i),
                    UserRole.TALLER,
                    "password123",
                    "https://api.dicebear.com/9.x/initials/svg?seed=M" + i + "&backgroundColor=1a6bbd");
            mechanics.add(userRepository.findByEmailIgnoreCase(email).orElseThrow());
        }

        initializeWorkshops(mechanics);

        // Ensure 15 default clients exist (idempotent by email).
        for (int i = 1; i <= 15; i++) {
            String email = "cliente" + i + "@user.local";
            upsertUser(
                    email,
                    "Cliente " + i,
                    UserRole.USER,
                    "password123",
                    "https://api.dicebear.com/9.x/initials/svg?seed=C" + i + "&backgroundColor=1a6bbd");
        }

        seedDemoIssues();

        log.info("Mechanics, workshops and clients initialization completed.");
    }

    private void upsertUser(String email, String fullName, UserRole role, String rawPassword, String avatarUrl) {
        String normalizedEmail = email.toLowerCase(Locale.ROOT);
        AppUser user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElseGet(AppUser::new);
        boolean isNew = user.getId() == null;

        user.setEmail(normalizedEmail);
        user.setFullName(fullName);
        user.setRole(role);
        user.setAvatarUrl(avatarUrl);

        if (isNew) {
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            user.setCreatedAt(LocalDateTime.now());
            AppUser saved = userRepository.save(user);
            log.info("Created {}: {}", role, saved.getEmail());
        }

        // Keep existing password for existing users.
        AppUser saved = userRepository.save(user);
        log.info("Updated {}: {}", role, saved.getEmail());
    }

    private void initializeWorkshops(List<AppUser> mechanics) {
        upsertWorkshop("Taller Central Autodiagnostico", "Calle Principal 123, Almeria", "+34 950 100 201",
                "central@taller.local", "L-V 08:00-18:00", "/taller1.png", 6, mechanics.get(0), 36.8381, -2.4597);
        upsertWorkshop("Auto Diagnosis Express", "Avenida del Mediterraneo 45, Almeria", "+34 950 100 202",
                "express@taller.local", "L-S 09:00-20:00", "/taller2.jpg", 4, mechanics.get(1), 36.8348, -2.4492);
        upsertWorkshop("Reparaciones Rapidas Sur", "Plaza Mayor 8, Almeria", "+34 950 100 203",
                "rapidas@taller.local", "L-V 07:30-16:30", "/taller3.jpg", 5, mechanics.get(2), 36.8424, -2.4665);
        upsertWorkshop("MotorLab Costa", "Camino de Ronda 72, Almeria", "+34 950 100 204",
                "motorlab@taller.local", "L-V 10:00-19:00", "/taller4.jpg", 3, mechanics.get(3), 36.8296, -2.4428);
    }

    private void upsertWorkshop(
            String name,
            String address,
            String phone,
            String email,
            String schedule,
            String photoUrl,
            int vehicleLimit,
            AppUser mechanic,
            double latitude,
            double longitude) {
        Workshop workshop = workshopRepository.findByNameIgnoreCase(name).orElseGet(Workshop::new);
        workshop.setName(name);
        workshop.setAddress(address);
        workshop.setPhone(phone);
        workshop.setEmail(email);
        workshop.setSchedule(schedule);
        workshop.setPhotoUrl(photoUrl);
        workshop.setVehicleLimit(vehicleLimit);
        workshop.setMechanicId(mechanic.getId());
        workshop.setLatitude(latitude);
        workshop.setLongitude(longitude);
        workshopRepository.save(workshop);
        log.info("Upserted workshop {} for mechanic {}", name, mechanic.getEmail());
    }

    private String mechanicName(int index) {
        return switch (index) {
            case 1 -> "Carlos Medina";
            case 2 -> "Lucia Navarro";
            case 3 -> "Andres Molina";
            case 4 -> "Marta Salas";
            default -> "Mecanico " + index;
        };
    }

        private void seedDemoIssues() {
        List<VehicleModel> models = vehicleModelRepository.findAll().stream()
            .sorted(Comparator.comparing(VehicleModel::getIdVehicleModel))
            .toList();

        if (models.size() < 6) {
            log.warn("No hay suficientes modelos de vehiculo para sembrar casos demo.");
            return;
        }

        AppUser client1 = userRepository.findByEmailIgnoreCase("cliente1@user.local").orElseThrow();
        AppUser client2 = userRepository.findByEmailIgnoreCase("cliente2@user.local").orElseThrow();
        AppUser client3 = userRepository.findByEmailIgnoreCase("cliente3@user.local").orElseThrow();

        AppUser mechanic1 = userRepository.findByEmailIgnoreCase("mecanico1@taller.local").orElseThrow();
        AppUser mechanic2 = userRepository.findByEmailIgnoreCase("mecanico2@taller.local").orElseThrow();
        AppUser mechanic3 = userRepository.findByEmailIgnoreCase("mecanico3@taller.local").orElseThrow();

        Workshop workshop1 = workshopRepository.findByNameIgnoreCase("Taller Central Autodiagnostico").orElseThrow();
        Workshop workshop2 = workshopRepository.findByNameIgnoreCase("Auto Diagnosis Express").orElseThrow();
        Workshop workshop3 = workshopRepository.findByNameIgnoreCase("Reparaciones Rapidas Sur").orElseThrow();

        seedIssue(client1, models.get(0), "1111AAA", "VIN0001", LocalDate.of(2018, 3, 10),
            mechanic1, workshop1, IssueStatus.WORKSHOP_ASSIGNED, "amarillo",
            "Revisando fallo de encendido. Esperando diagnostico.");

        seedIssue(client1, models.get(1), "2222BBB", "VIN0002", LocalDate.of(2016, 7, 5),
            mechanic2, workshop2, IssueStatus.IN_PROGRESS, "naranja",
            "En reparacion. Sustituyendo bobinas.");

        seedIssue(client2, models.get(2), "3333CCC", "VIN0003", LocalDate.of(2020, 1, 20),
            mechanic2, workshop2, IssueStatus.BUDGET_ACCEPTED, "amarillo",
            "Presupuesto aceptado. Preparando recambios.");

        seedIssue(client2, models.get(3), "4444DDD", "VIN0004", LocalDate.of(2015, 11, 2),
            mechanic3, workshop3, IssueStatus.FIXED, "verde",
            "Vehiculo reparado. Listo para entrega.");

        seedIssue(client3, models.get(4), "5555EEE", "VIN0005", LocalDate.of(2019, 5, 12),
            mechanic1, workshop1, IssueStatus.IN_PROGRESS, "naranja",
            "En taller. Revisando sistema electrico.");

        seedIssue(client3, models.get(5), "6666FFF", "VIN0006", LocalDate.of(2017, 9, 8),
            mechanic3, workshop3, IssueStatus.WORKSHOP_ASSIGNED, "amarillo",
            "Vehiculo recibido. Diagnostico pendiente.");
        }

        private void seedIssue(
            AppUser client,
            VehicleModel model,
            String plate,
            String vin,
            LocalDate buildDate,
            AppUser mechanic,
            Workshop workshop,
            IssueStatus status,
            String progressColor,
            String latestUpdate) {
        PersonalVehicle personalVehicle = findOrCreatePersonalVehicle(client, model, plate, vin, buildDate);

        String sessionUuid = UUID.nameUUIDFromBytes(
            ("seed-" + client.getEmail() + "-" + plate).getBytes(StandardCharsets.UTF_8))
            .toString();

        Issue issue = issueRepository.findBySessionUuid(sessionUuid).orElseGet(Issue::new);
        issue.setPersonalVehicle(personalVehicle);
        issue.setWorkshop(workshop);
        issue.setDescription("Caso demo: " + latestUpdate);
        issue.setAiDiagnosis("Diagnostico preliminar generado para demo");
        issue.setRecommendedParts("[]");
        issue.setEstimatedPrice(BigDecimal.ZERO);
        issue.setStatus(status);
        issue.setProgressColor(progressColor);
        issue.setLatestUpdate(latestUpdate);
        issue.setSessionUuid(sessionUuid);
        issue.setAcceptedAt(LocalDateTime.now().minusDays(2));
        issue.setActive(true);
        issue = issueRepository.save(issue);

        seedChatRoomPresence(issue, client, mechanic);

        if (!chatMessageRepository.existsByIssueId(issue.getId())) {
            String firstMessage = "[ACTUALIZACION] " + latestUpdate;
            chatMessageRepository.save(ChatMessage.builder()
                .issue(issue)
                .sessionUuid(sessionUuid)
                .sender(mechanic)
                .senderRole(ChatSenderRole.MECANICO)
                .commentText(firstMessage)
                .wordCount(firstMessage.split("\\s+").length)
                .readByUser(false)
                .build());
        }
        }

    private void seedChatRoomPresence(Issue issue, AppUser client, AppUser mechanic) {
        upsertPresence(issue, client);
        upsertPresence(issue, mechanic);
    }

    private void upsertPresence(Issue issue, AppUser participant) {
        ChatRoomPresence presence = chatRoomPresenceRepository
                .findByIssueIdAndParticipantId(issue.getId(), participant.getId())
                .orElseGet(ChatRoomPresence::new);

        presence.setIssue(issue);
        presence.setParticipant(participant);
        presence.setActive(true);
        chatRoomPresenceRepository.save(presence);
    }

        private PersonalVehicle findOrCreatePersonalVehicle(
            AppUser owner,
            VehicleModel model,
            String plate,
            String vin,
            LocalDate buildDate) {
        return personalVehicleRepository.findByOwnerIdOrderByIdDesc(owner.getId()).stream()
            .filter(vehicle -> plate.equalsIgnoreCase(vehicle.getPlate())
                || (vin != null && vin.equalsIgnoreCase(vehicle.getVin())))
            .findFirst()
            .orElseGet(() -> personalVehicleRepository.save(PersonalVehicle.builder()
                .owner(owner)
                .vehicleModel(model)
                .plate(plate)
                .vin(vin)
                .buildDate(buildDate)
                .build()));
        }
}
