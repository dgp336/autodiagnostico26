# Índice por flujo

Este documento organiza la documentación por flujos funcionales para que encuentres rápidamente los componentes, endpoints y modelos relacionados.

## 1. Autenticación y Onboarding
- Componentes frontend:
  - [Login](componentes/login.md) — formulario de acceso y registro.
- Backend / modelos:
  - [API de autenticación](api/api-tracking.md#auth)
  - [Modelo de usuario](modelos-datos.md#appuser)

## 2. Flujo de Autodiagnóstico
- Componentes frontend:
  - [Diagnóstico](componentes/diagnostico.md)
  - [Selecciona problema](componentes/selecciona-problema.md)
- Backend / modelos:
  - [Endpoint de autodiagnóstico](api/api-tracking.md#autodiagnosis)
  - [Modelo `Product` / resultados](modelos-datos.md#product)

## 3. Gestión de Vehículos (cliente)
- Componentes frontend:
  - [Introducir vehículo](componentes/introducir-vehiculo.md)
  - [Mis vehículos](componentes/mis-vehiculos.md)
- Backend / modelos:
  - [Vehículos y modelos](modelos-datos.md#vehicle)
  - [PersonalVehicle](modelos-datos.md#personalvehicle)

## 4. Búsqueda y Selección de Taller
- Componentes frontend:
  - [Taller](componentes/taller.md)
  - [Mapa](componentes/map.md)
- Backend / modelos:
  - [Workshops / WorkshopApplication](modelos-datos.md#workshop)
  - [Flujo de creación de taller](flujo-creacion-taller.md)
  - [API de talleres](api/api-tracking.md#workshop)

## 5. Registro y Aprobación de Talleres (admin)
- Componentes frontend:
  - [Registro taller](componentes/registro-taller.md)
  - [Admin: Gestión taller](componentes/admin.md)
- Backend / modelos:
  - [WorkshopApplication endpoints](api/api-tracking.md#workshop-application)
  - [Estados de `WorkshopApplication`](modelos-datos.md#workshopapplication)

## 6. Seguimiento y Chat (sessionUuid)
- Componentes frontend:
  - [Seguimiento](componentes/seguimiento.md)
  - Componentes de chat y detalle dentro del flujo de seguimiento.
- Backend / modelos:
  - [Issue, ChatMessage, ChatRoomPresence](modelos-datos.md#issue)
  - [API de chat y seguimiento](api/api-tracking.md#chat)
  - [Flujo frontend ↔ backend para seguimientos](flujo-frontend-backend.md)

## 7. Contacto y Administración
- Componentes frontend:
  - [Contacto](componentes/contacto.md)
  - [Admin: Gestión usuarios / contacto](componentes/admin.md)
- Backend / modelos:
  - [ContactMessage](modelos-datos.md#contactmessage)
  - [API de contacto](api/api-tracking.md#contact)

## 8. Perfil y Ajustes del Usuario
- Componentes frontend:
  - [Perfil](componentes/perfil.md)
  - [Cambiar rol (admin)](componentes/cambiar-rol.md)
- Backend / modelos:
  - [Endpoints de usuario](api/api-tracking.md#user)

---

Si necesitas, puedo generar una versión imprimible (PDF) de este índice o añadir una tabla de dependencias entre flujos (por ejemplo: qué endpoints son críticos para cada flujo).
