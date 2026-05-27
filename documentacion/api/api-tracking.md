# API del backend

Guía de referencia de los endpoints REST del backend de Autodiagnóstico 26.

## Base URL

En local, todos los controladores cuelgan de:

```txt
/api
```

## Formato de error

La capa global de errores devuelve respuestas con esta estructura:

```json
{
  "timestamp": "2026-05-27T19:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "La solicitud contiene datos invalidos"
}
```

Los errores de validación (`@Valid`) y `IllegalArgumentException` devuelven `400`. Los errores del asistente IA o del servidor MCP se traducen normalmente a `502` o `503`.

---

## Autenticación

### `POST /api/auth/register`

Crea un usuario nuevo.

#### Body

```json
{
  "fullName": "Ana Perez",
  "email": "ana@example.com",
  "password": "secreta123",
  "role": "USER"
}
```

#### Respuesta

`201 Created` con `AuthUserResponseDTO`.

Campos principales:

- `id`
- `fullName`
- `email`
- `role`
- `avatarUrl`
- `createdAt`
- `city`
- `postalCode`

### `POST /api/auth/login`

Inicia sesión con email y contraseña.

#### Body

```json
{
  "email": "ana@example.com",
  "password": "secreta123"
}
```

#### Respuesta

`200 OK` con `AuthUserResponseDTO`.

---

## Usuarios

### `GET /api/users`

Lista todos los usuarios.

### `GET /api/users/{id}`

Devuelve un usuario por ID.

### `PUT /api/users/{id}`

Actualiza datos de perfil.

#### Body

```json
{
  "fullName": "Ana Perez",
  "email": "ana@example.com",
  "city": "Almeria",
  "postalCode": "04001"
}
```

### `PUT /api/users/{id}/password`

Actualiza la contraseña.

#### Body

```json
{
  "currentPassword": "vieja123",
  "newPassword": "nueva123"
}
```

### `POST /api/users/{id}/avatar`

Sube un avatar en `multipart/form-data`.

#### Form field

- `file`

#### Respuesta

```json
{
  "avatarUrl": "data:image/png;base64,..."
}
```

### `DELETE /api/users/{id}`

Elimina un usuario.

### `PUT /api/users/{id}/role`

Actualiza el rol del usuario.

#### Body

```json
{
  "role": "ADMIN"
}
```

---

## Vehículos

### `GET /api/vehicles/brands`

Devuelve la lista de marcas disponibles.

### `GET /api/vehicles/brands/{brand}/models`

Devuelve los modelos de una marca.

#### Respuesta

Lista de `VehicleModelSummaryDTO`:

```json
[
  { "id": 1, "name": "Ibiza" }
]
```

### `GET /api/vehicles/{vehicleId}/variants`

Devuelve las variantes de un vehículo.

#### Respuesta

Lista de `VehicleVariantDTO` con campos como `id`, `modelName`, `transmission`, `engineName` y `engineType`.

---

## Vehículos personales

### `GET /api/personal-vehicles?ownerId={ownerId}`

Lista los vehículos del propietario.

### `GET /api/personal-vehicles/{id}`

Devuelve un vehículo personal por ID.

### `POST /api/personal-vehicles`

Crea un vehículo personal.

#### Body

`CreatePersonalVehicleRequestDTO`.

### `DELETE /api/personal-vehicles/{id}?ownerId={ownerId}`

Elimina un vehículo personal validando el propietario.

---

## Talleres y solicitudes

### `GET /api/workshops`

Lista talleres. El query `clientId` es opcional y se usa para marcar selección del cliente.

### `GET /api/workshops/{workshopId}?clientId={clientId}`

Devuelve un taller concreto.

### `POST /api/workshops/{workshopId}/select`

Selecciona un taller para un cliente.

#### Body

```json
{
  "clientId": 11,
  "personalVehicleId": 25,
  "description": "El coche hace ruido al arrancar"
}
```

#### Respuesta

`WorkshopSelectionResponseDTO` con:

- `workshop`
- `tracking`

### `GET /api/workshops/exists-for-mechanic/{mechanicId}`

Comprueba si existe un taller asociado al mecánico.

#### Respuesta

```json
{
  "exists": true
}
```

### `POST /api/workshop-applications`

Envía una solicitud para crear un taller.

#### Body

```json
{
  "fullName": "Mecanica Lopez",
  "email": "taller@example.com",
  "password": "secreta123",
  "workshopName": "Taller Lopez",
  "address": "Calle Falsa 123",
  "phone": "600000000",
  "schedule": "L-V 9:00-18:00",
  "photoUrl": "https://...",
  "vehicleLimit": 4,
  "latitude": 36.84,
  "longitude": -2.46
}
```

#### Respuesta

`WorkshopApplicationResponseDTO` con datos de la solicitud y su estado.

### `GET /api/workshop-applications/pending`

Lista solicitudes pendientes.

### `POST /api/workshop-applications/{applicationId}/approve`

Aproba una solicitud y crea el taller/mecánico asociado.

### `POST /api/workshop-applications/{applicationId}/reject`

Rechaza una solicitud.

### `DELETE /api/workshop-applications/workshops/{workshopId}`

Elimina un taller aprobado.

---

## Autodiagnóstico e issues

### `POST /api/autodiagnosis/diagnose`

Ejecuta el autodiagnóstico sin persistir el issue.

#### Body

```json
{
  "clientId": 11,
  "personalVehicleId": 25,
  "vehicleModelId": 7,
  "symptoms": ["ruido al arrancar", "vibracion"],
  "freeText": "Se oye un golpe al acelerar",
  "year": 2018,
  "engineType": "GASOLINE",
  "transmission": "MANUAL"
}
```

#### Respuesta

`AutodiagnosisResponseDTO`:

- `diagnosis`
- `confidence`
- `explanation`
- `suggestedParts`
- `unresolvedPartNames`

### `POST /api/issues`

Crea el issue borrador a partir del mismo payload de autodiagnóstico.

#### Body

`AutodiagnosisRequestDTO`.

#### Respuesta

`AutodiagnosisResponseDTO`.

---

## Seguimiento del mecánico

### `GET /api/mechanic/{mechanicId}/clients`

Devuelve los clientes del mecánico.

#### Respuesta

Lista de `MechanicClientDTO`.

### `GET /api/mechanic/client/{clientId}/trackings`

Devuelve los seguimientos de un cliente.

### `GET /api/mechanic/tracking/{sessionUuid}`

Devuelve un tracking concreto por `sessionUuid`.

### `POST /api/mechanic/{mechanicId}/tracking/{sessionUuid}/status`

Actualiza el estado del tracking.

#### Body

```json
{
  "status": "rojo"
}
```

### `POST /api/mechanic/{mechanicId}/tracking/{sessionUuid}/tracking-update`

Actualiza el último mensaje del seguimiento.

#### Body

```json
{
  "message": "Se ha pedido la pieza y llega mañana"
}
```

#### Campos clave de `MechanicClientDTO`

- `clientId`
- `workshopId`
- `mechanicId`
- `problemDescription`
- `aiDiagnosis`
- `recommendedParts`
- `latestUpdate`
- `status`
- `sessionUuid`
- `issueId`

---

## Chat

El chat se identifica por `sessionUuid`. No depende del login, sino de la sesión de seguimiento asociada al issue.

### `POST /api/chat/join?sessionUuid={sessionUuid}&participantId={participantId}`

Entrar a una sala.

#### Respuesta

`ChatJoinResponseDTO` con:

- `sessionUuid`
- `participantId`
- `activeUsers`
- `maxUsers`
- `joined`

### `POST /api/chat/leave?sessionUuid={sessionUuid}&participantId={participantId}`

Salir de la sala.

### `GET /api/chat/mensajes?sessionUuid={sessionUuid}&limit=50&afterId={afterId}`

Lista mensajes de una sesión.

### `POST /api/chat/mensajes`

Envía un mensaje.

#### Body

```json
{
  "participantId": 11,
  "senderRole": "USER",
  "sessionUuid": "uuid",
  "commentText": "Hola, ¿qué tal va el coche?"
}
```

#### Respuesta

`ChatMessageResponseDTO` con:

- `id`
- `participantId`
- `sessionUuid`
- `senderRole`
- `commentText`
- `wordCount`
- `readByUser`
- `createdAt`

### `GET /api/chat/unread?sessionUuid={sessionUuid}`

Devuelve el total de mensajes no leídos.

### `POST /api/chat/mark-read?sessionUuid={sessionUuid}`

Marca como leídos los mensajes de la sesión para el usuario actual.

### `GET /api/chat/presence?sessionUuid={sessionUuid}&participantId={participantId}`

Comprueba si un participante está online en la sala.

---

## Contacto

### `POST /api/contact`

Envía un mensaje de contacto público.

#### Body

```json
{
  "name": "Ana Perez",
  "email": "ana@example.com",
  "phone": "600000000",
  "message": "Necesito ayuda con mi coche",
  "workshopId": 3
}
```

### `GET /api/admin/contact`

Lista todos los mensajes de contacto para administración.

### `POST /api/admin/contact/{id}/reply`

Responde a un mensaje de contacto.

#### Body

```json
{
  "message": "Gracias por escribirnos, te contestamos en breve"
}
```

---

## Geolocalización

### `GET /api/geolocation`

Devuelve una posición aproximada para el cliente.

#### Respuesta

```json
{
  "lat": 40.416775,
  "lng": -3.70379
}
```

Si el servicio externo falla, el backend devuelve un fallback fijo.

---

## Resumen rápido de modelos

- `AuthUserResponseDTO`: usuario autenticado o listado de usuarios.
- `WorkshopDTO`: ficha del taller, mecánico asociado, estado de selección y vehículos en reparación.
- `WorkshopApplicationResponseDTO`: solicitud de alta de taller y su estado.
- `PersonalVehicleResponseDTO`: vehículo registrado por un usuario.
- `MechanicClientDTO`: seguimiento completo de un cliente/sesión.
- `ChatMessageRequestDTO` / `ChatMessageResponseDTO`: entrada y salida del chat.
- `AutodiagnosisRequestDTO` / `AutodiagnosisResponseDTO`: entrada y salida del motor de diagnóstico.

---

## Nota funcional

El identificador que une seguimiento, chat y estado del caso es `sessionUuid`.

Ese UUID es el hilo conductor entre:

- issue creado por autodiagnóstico
- tracking del mecánico
- sala de chat
- mensajes leídos/no leídos
