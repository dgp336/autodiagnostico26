package es.ual.dra.autodiagnostico.service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import es.ual.dra.autodiagnostico.model.entitity.user.AppUser;
import es.ual.dra.autodiagnostico.model.entitity.user.UserRole;
import es.ual.dra.autodiagnostico.model.entitity.core.Issue;
import es.ual.dra.autodiagnostico.model.entitity.core.IssueStatus;
import es.ual.dra.autodiagnostico.model.entitity.core.PersonalVehicle;
import es.ual.dra.autodiagnostico.model.entitity.core.VehicleModel;
import es.ual.dra.autodiagnostico.model.entitity.core.Workshop;
import es.ual.dra.autodiagnostico.repository.UserRepository;
import es.ual.dra.autodiagnostico.model.entitity.core.Workshop;
import es.ual.dra.autodiagnostico.repository.WorkshopRepository;
import es.ual.dra.autodiagnostico.repository.IssueRepository;
import es.ual.dra.autodiagnostico.repository.PersonalVehicleRepository;
import es.ual.dra.autodiagnostico.repository.VehicleModelRepository;
import es.ual.dra.autodiagnostico.repository.chat.ChatMessageRepository;
import es.ual.dra.autodiagnostico.model.entitity.chat.ChatMessage;
import es.ual.dra.autodiagnostico.model.entitity.chat.ChatSenderRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

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
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Initializing mechanics and clients data...");
        initializeMechanicsAndClients();
    }

    private void initializeMechanicsAndClients() {
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

        initializeDemoRepairCases();

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

        private void initializeDemoRepairCases() {
        List<VehicleModel> models = vehicleModelRepository.findAll().stream()
            .sorted(Comparator.comparing(VehicleModel::getIdVehicleModel))
            .toList();

        if (models.size() < 4) {
            log.warn("No hay suficientes modelos de vehículo para sembrar casos de chat.");
            return;
        }

        AppUser client1 = userRepository.findByEmailIgnoreCase("cliente1@user.local").orElseThrow();
        AppUser client2 = userRepository.findByEmailIgnoreCase("cliente2@user.local").orElseThrow();
        AppUser client3 = userRepository.findByEmailIgnoreCase("cliente3@user.local").orElseThrow();
        AppUser client4 = userRepository.findByEmailIgnoreCase("cliente4@user.local").orElseThrow();

        AppUser mechanic1 = userRepository.findByEmailIgnoreCase("mecanico1@taller.local").orElseThrow();
        AppUser mechanic2 = userRepository.findByEmailIgnoreCase("mecanico2@taller.local").orElseThrow();
        AppUser mechanic3 = userRepository.findByEmailIgnoreCase("mecanico3@taller.local").orElseThrow();
        AppUser mechanic4 = userRepository.findByEmailIgnoreCase("mecanico4@taller.local").orElseThrow();

        seedCase(client1, models.get(0), "1111AAA", LocalDate.of(2023, 3, 10), mechanic1,
            "Taller Central Autodiagnostico", "Motor no arranca y hace clic",
            "Bateria descargada o motor de arranque",
            "[{\"idProduct\":101,\"name\":\"Bateria 12V\",\"description\":\"Bateria de sustitucion\",\"lowRangePrice\":120.0,\"highRangePrice\":180.0,\"image\":null}]",
            new BigDecimal("150.00"),
            "Hemos recibido el vehiculo. Vamos a comprobar bateria y arranque.");

        seedCase(client2, models.get(1), "2222BBB", LocalDate.of(2022, 7, 18), mechanic2,
            "Auto Diagnosis Express", "Vibracion al frenar y pedal blando",
            "Discos de freno y liquido de frenos",
            "[{\"idProduct\":102,\"name\":\"Discos de freno\",\"description\":\"Juego delantero\",\"lowRangePrice\":90.0,\"highRangePrice\":140.0,\"image\":null},{\"idProduct\":103,\"name\":\"Liquido de frenos\",\"description\":\"DOT4\",\"lowRangePrice\":12.0,\"highRangePrice\":18.0,\"image\":null}]",
            new BigDecimal("175.00"),
            "El coche ya esta en elevador. Revisión de frenos en curso.");

        seedCase(client3, models.get(2), "3333CCC", LocalDate.of(2024, 1, 22), mechanic3,
            "Reparaciones Rapidas Sur", "Aire acondicionado no enfria",
            "Filtro habitaculo y recarga de gas",
            "[{\"idProduct\":104,\"name\":\"Filtro habitaculo\",\"description\":\"Filtro polen\",\"lowRangePrice\":18.0,\"highRangePrice\":25.0,\"image\":null}]",
            new BigDecimal("95.00"),
            "Estamos revisando el circuito del aire acondicionado.");

        seedCase(client4, models.get(3), "4444DDD", LocalDate.of(2021, 11, 2), mechanic4,
            "MotorLab Costa", "Ruido extraño en el motor y perdida de potencia",
            "Bobinas y bujias",
            "[{\"idProduct\":105,\"name\":\"Bujias\",\"description\":\"Juego completo\",\"lowRangePrice\":30.0,\"highRangePrice\":50.0,\"image\":null}]",
            new BigDecimal("210.00"),
            "Estamos escuchando el motor y validando la mezcla.");
        }

        private void seedCase(
            AppUser client,
            VehicleModel model,
            String plate,
            LocalDate buildDate,
            AppUser mechanic,
            String workshopName,
            String problem,
            String aiDiagnosis,
            String recommendedPartsJson,
            BigDecimal estimatedPrice,
            String latestUpdate) {
        PersonalVehicle personalVehicle = findOrCreatePersonalVehicle(client, model, plate, buildDate);
        Workshop workshop = workshopRepository.findByNameIgnoreCase(workshopName).orElseThrow();
        String sessionUuid = UUID.nameUUIDFromBytes(("demo-issue-" + client.getEmail() + "-" + model.getIdVehicleModel())
            .getBytes(StandardCharsets.UTF_8)).toString();

        issueRepository.findByPersonalVehicleOwnerIdAndPersonalVehicleIdAndActiveTrue(client.getId(), personalVehicle.getId())
            .forEach(existing -> existing.setActive(false));

        Issue issue = issueRepository.findBySessionUuid(sessionUuid).orElseGet(Issue::new);
        issue.setPersonalVehicle(personalVehicle);
        issue.setWorkshop(workshop);
        issue.setDescription(problem);
        issue.setAiDiagnosis(aiDiagnosis);
        issue.setRecommendedParts(recommendedPartsJson);
        issue.setEstimatedPrice(estimatedPrice);
        issue.setStatus(IssueStatus.WORKSHOP_ASSIGNED);
        issue.setProgressColor("amarillo");
        issue.setLatestUpdate(latestUpdate);
        issue.setSessionUuid(sessionUuid);
        issue.setActive(true);
        issue = issueRepository.save(issue);

        if (!chatMessageRepository.existsByIssueId(issue.getId())) {
            chatMessageRepository.save(ChatMessage.builder()
                .issue(issue)
                .sessionUuid(sessionUuid)
                .sender(mechanic)
                .senderRole(ChatSenderRole.MECANICO)
                .commentText("Caso de prueba creado para verificar el chat y el seguimiento.")
                .wordCount(9)
                .readByUser(false)
                .build());
        }

        log.info("Demo issue seeded for {} with mechanic {} and workshop {} (session={})",
            client.getEmail(), mechanic.getEmail(), workshop.getName(), sessionUuid);
        }

        private PersonalVehicle findOrCreatePersonalVehicle(AppUser owner, VehicleModel model, String plate, LocalDate buildDate) {
        return personalVehicleRepository.findByOwnerIdOrderByIdDesc(owner.getId()).stream()
            .filter(vehicle -> vehicle.getVehicleModel() != null
                && vehicle.getVehicleModel().getIdVehicleModel().equals(model.getIdVehicleModel()))
            .findFirst()
            .orElseGet(() -> personalVehicleRepository.save(PersonalVehicle.builder()
                .owner(owner)
                .vehicleModel(model)
                .plate(plate)
                .buildDate(buildDate)
                .build()));
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
}
