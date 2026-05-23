# WorkshopApplication — Solicitudes de registro de talleres

Breve descripción: `WorkshopApplication` almacena las solicitudes que envían talleres para registrarse en la plataforma. Un administrador revisa las solicitudes y puede aprobar o rechazar. Al aprobar, se crea un `AppUser` con rol `TALLER` y un `Workshop` asociado.

- **Entidad (backend):** [backend/src/main/java/es/ual/dra/autodiagnostico/model/entitity/core/WorkshopApplication.java](backend/src/main/java/es/ual/dra/autodiagnostico/model/entitity/core/WorkshopApplication.java)
  - Ahora usa relaciones JPA hacia `Workshop` y `AppUser` en lugar de guardar solo IDs:
    - `@ManyToOne @JoinColumn(name = "approved_workshop_id")` → `approvedWorkshop`
    - `@ManyToOne @JoinColumn(name = "approved_mechanic_id")` → `approvedMechanic`
  - Campos de metadatos: `createdAt`, `reviewedAt`, `status`.

- **DTOs:**
  - Request: [backend/src/main/java/es/ual/dra/autodiagnostico/dto/WorkshopApplicationRequestDTO.java](backend/src/main/java/es/ual/dra/autodiagnostico/dto/WorkshopApplicationRequestDTO.java)
  - Response: [backend/src/main/java/es/ual/dra/autodiagnostico/dto/WorkshopApplicationResponseDTO.java](backend/src/main/java/es/ual/dra/autodiagnostico/dto/WorkshopApplicationResponseDTO.java)
    - El `ResponseDTO` expone `approvedWorkshopId` y `approvedMechanicId` (IDs extraídos de las relaciones JPA), por compatibilidad con el frontend.

- **Lógica de negocio:**
  - Servicio: [backend/src/main/java/es/ual/dra/autodiagnostico/service/WorkshopApplicationService.java](backend/src/main/java/es/ual/dra/autodiagnostico/service/WorkshopApplicationService.java)
    - `submit(...)` valida duplicados, hashea la contraseña y guarda la solicitud en estado `PENDING`.
    - `approve(id)` crea un `AppUser` (rol `TALLER`) y un `Workshop`, asigna las relaciones (`approvedMechanic`, `approvedWorkshop`) y marca la solicitud como `APPROVED`.
    - `reject(id)` marca la solicitud como `REJECTED`.
    - `deleteWorkshop(id)` borra el taller (si no tiene `Issue` asociados) y el `AppUser` del mecánico si corresponde.

- **Controlador (endpoints):**
  - [backend/src/main/java/es/ual/dra/autodiagnostico/controller/WorkshopApplicationController.java](backend/src/main/java/es/ual/dra/autodiagnostico/controller/WorkshopApplicationController.java)
  - Rutas principales:
    - `POST /api/workshop-applications` — enviar solicitud
    - `GET /api/workshop-applications/pending` — listar pendientes
    - `POST /api/workshop-applications/{id}/approve` — aprobar
    - `POST /api/workshop-applications/{id}/reject` — rechazar
    - `DELETE /api/workshop-applications/workshops/{id}` — borrar taller (admin)

- **Frontend:**
  - API service: [frontend/src/app/services/workshop-application-api.service.ts](frontend/src/app/services/workshop-application-api.service.ts)
  - Componentes:
    - Registro: [frontend/src/app/components/registro-taller/registro-taller.ts](frontend/src/app/components/registro-taller/registro-taller.ts)
    - Admin: [frontend/src/app/admin/admin.component.ts](frontend/src/app/admin/admin.component.ts)
  - El frontend envía la solicitud con la contraseña en claro (se hashea en el backend). Después de aprobar, el frontend obtiene IDs en el `WorkshopApplicationResponse`.

## Notas de migración / impactos

- Cambios en DB: la columna `approved_workshop_id` y `approved_mechanic_id` se mantienen, pero ahora son claves foraneas que apuntan a `workshop.id` y `app_users.id` respectivamente (mapeadas por JPA). Si se usa esquema SQL manual, asegurarse de añadir las FK:

  - `ALTER TABLE workshop_application ADD CONSTRAINT fk_wa_workshop FOREIGN KEY (approved_workshop_id) REFERENCES workshop(id);`
  - `ALTER TABLE workshop_application ADD CONSTRAINT fk_wa_mechanic FOREIGN KEY (approved_mechanic_id) REFERENCES app_users(id);`

- Compatibilidad: el `ResponseDTO` continúa exponiendo solo los IDs para no romper el frontend existente. Internamente se usan relaciones JPA para facilitar consultas y navegación desde la entidad.

## Qué revisar en runtime

- Reiniciar la aplicación para que Hibernate aplique los cambios (si `spring.jpa.hibernate.ddl-auto=update` está activo).
- Comprobar con seeds que al aprobar una solicitud:
  - se crea un `AppUser` con rol `TALLER` (ver `MechanicsDataInitializer`),
  - se crea un `Workshop` y su `mechanicId` apunte al nuevo `AppUser`,
  - la `WorkshopApplication` referencie al `Workshop` y al `AppUser` mediante las FK y el `ResponseDTO` muestre los IDs.

Si quieres, puedo: 1) añadir las sentencias SQL de FK en el directorio `data/` o 2) crear una migración (Flyway) que añada las constraints.
