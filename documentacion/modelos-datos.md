# Modelo de datos

Este documento resume las entidades persistentes principales de AutoDiagnóstico 26 y cómo se relacionan entre sí.

Para ver los endpoints concretos, consulta [documentacion/api/api-tracking.md](api/api-tracking.md).

---

## Visión general

El dominio gira alrededor de estos ejes:

- usuarios y roles
- vehículos personales
- talleres y solicitudes de alta
- issues de autodiagnóstico
- seguimiento mecánico
- chat persistente
- mensajes de contacto

La clave transversal del flujo de seguimiento es `sessionUuid`.

---

## Entidades principales

### `AppUser`

Tabla: `app_users`

Representa a cualquier usuario de la plataforma.

Campos relevantes:

- `id`
- `fullName`
- `email`
- `passwordHash`
- `role`
- `avatarUrl`
- `createdAt`
- `city`
- `postalCode`

Uso:

- autenticación y perfil
- cliente final
- mecánico / taller
- administrador

### `Workshop`

Tabla: `workshop`

Representa el taller aprobado de un mecánico.

Campos relevantes:

- `id`
- `name`
- `address`
- `phone`
- `email`
- `schedule`
- `photoUrl`
- `vehicleLimit`
- `mechanicId`
- `latitude`
- `longitude`

Uso:

- listado público de talleres
- selección por parte del cliente
- relación con el mecánico dueño del taller

### `WorkshopApplication`

Tabla: `workshop_application`

Representa la solicitud de alta de un taller.

Campos relevantes:

- `id`
- `applicantFullName`
- `applicantEmail`
- `passwordHash`
- `workshopName`
- `address`
- `phone`
- `email`
- `schedule`
- `photoUrl`
- `vehicleLimit`
- `latitude`
- `longitude`
- `status`
- `approvedWorkshop`
- `approvedMechanic`
- `createdAt`
- `reviewedAt`

Estados:

- `PENDING`
- `APPROVED`
- `REJECTED`

### `PersonalVehicle`

Tabla: `personal_vehicle`

Representa un vehículo de propiedad de un usuario.

Campos relevantes:

- `id`
- `vehicleModel`
- `owner`
- `buildDate`
- `vin`
- `plate`

Uso:

- catálogo privado del cliente
- base para crear issues y seleccionar taller

### `Vehicle`

Tabla: `vehicle`

Representa la marca y el modelo base extraídos del catálogo.

Campos relevantes:

- `idVehicle`
- `brand`
- `name`
- atributos técnicos de scraping como `wheelbase`, `height`, `length`, `width`, `weight`, `periodOfProduction`, `engineDisplacement`

Relación:

- un `Vehicle` tiene muchos `VehicleModel`

### `VehicleModel`

Tabla: `vehicle_model`

Representa una variante concreta de un vehículo.

Campos relevantes:

- `idVehicleModel`
- `vehicle`
- `modelName`
- `yearFirstProduction`
- `transmission`
- `engine`

Relación:

- un `VehicleModel` pertenece a un `Vehicle`
- un `VehicleModel` puede tener muchos `PersonalVehicle`

### `Product`

Tabla: `product`

Representa una pieza o producto sugerido por el autodiagnóstico.

Campos relevantes:

- `idProduct`
- `name`
- `description`
- `lowRangePrice`
- `highRangePrice`
- `image`

Uso:

- salida del motor de diagnóstico
- sugerencias de reparación para el cliente o mecánico

### `Issue`

Tabla: `issue`

Representa el seguimiento principal de un caso abierto por autodiagnóstico.

Campos relevantes:

- `id`
- `personalVehicle`
- `workshop`
- `description`
- `aiDiagnosis`
- `recommendedParts`
- `estimatedPrice`
- `status`
- `progressColor`
- `latestUpdate`
- `budgetAmount`
- `acceptedAt`
- `inProgressAt`
- `fixedAt`
- `active`
- `sessionUuid`
- `createdAt`
- `updatedAt`

Notas:

- `sessionUuid` es la clave lógica del seguimiento.
- el chat, el tracking y las actualizaciones del mecánico usan ese UUID.
- el issue puede existir antes de asignar taller.

Estados:

- `DRAFT`
- `WORKSHOP_ASSIGNED`
- `BUDGET_ACCEPTED`
- `IN_PROGRESS`
- `RESOLVED`
- `CANCELLED`
- `FIXED`

### `ChatMessage`

Tabla: `chat_message`

Representa cada mensaje persistente del chat de seguimiento.

Campos relevantes:

- `id`
- `issue`
- `sender`
- `senderRole`
- `sessionUuid`
- `commentText`
- `wordCount`
- `readByUser`
- `createdAt`

Estados / roles:

- `MECANICO`
- `USUARIO`

Notas:

- los mensajes se agrupan por `sessionUuid`
- el sender puede ser nulo en algunos flujos internos, pero el rol siempre identifica el origen funcional

### `ChatRoomPresence`

Tabla: `chat_room_presence`

Representa la presencia de cada participante en una sala de seguimiento.

Campos relevantes:

- `id`
- `issue`
- `participant`
- `active`
- `joinedAt`
- `updatedAt`

Restricción importante:

- un participante solo puede tener una fila activa por issue

### `ContactMessage`

Tabla: `contact_message`

Representa un mensaje enviado desde el formulario de contacto.

Campos relevantes:

- `id`
- `name`
- `email`
- `phone`
- `message`
- `workshopId`
- `createdAt`
- `repliedAt`
- `replyMessage`

Uso:

- buzón de administración
- respuesta manual desde el panel admin

---

## Flujo de datos más importante

### 1. Autodiagnóstico

1. El cliente lanza el diagnóstico sobre un vehículo personal.
2. El backend devuelve una sugerencia con piezas, diagnóstico y explicación.
3. Si el caso se materializa, se crea un `Issue` con `sessionUuid`.

### 2. Seguimiento

1. El mecánico abre el seguimiento por `sessionUuid`.
2. Actualiza estado y mensaje usando ese mismo UUID.
3. El cliente ve el progreso desde su lista de seguimientos.

### 3. Chat

1. Cliente y mecánico hacen `join` en la misma sala.
2. Los mensajes se guardan en `chat_message`.
3. La presencia activa se controla en `chat_room_presence`.

### 4. Alta de taller

1. El formulario crea una `WorkshopApplication`.
2. El administrador aprueba o rechaza la solicitud.
3. Si se aprueba, se crea el `Workshop` definitivo y se asocia al mecánico.

---

## Observaciones de diseño

- `sessionUuid` es la llave funcional central del seguimiento.
- `Issue` es el modelo que conecta vehículo, taller, diagnóstico y chat.
- `WorkshopApplication` es temporal; `Workshop` es el resultado aprobado.
- `ChatRoomPresence` existe para controlar la presencia antes de permitir mensajes.
- `ContactMessage` es independiente del flujo de seguimiento.

---

## Documentos relacionados

- [API del backend](api/api-tracking.md)
- [Flujo de creación de taller](flujo-creacion-taller.md)
- [Seguimientos: sessionUuid y cambios recientes](logica/seguimiento-sessionUuid.md)
- [Sistema de Chat](logica/chat-system.md)
- [Sistema Mecánico ↔ Cliente](logica/mecanico-user-flow.md)
