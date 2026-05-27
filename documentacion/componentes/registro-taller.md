# Registro de Taller

Este componente permite a un mecánico solicitar el alta de su taller desde el frontend.

## Componente principal

- `RegistroTallerComponent` en `frontend/src/app/components/registro-taller/`

## Qué hace

El formulario recoge los datos de la cuenta del mecánico y del taller:

| Campo | Entidad | Uso |
| :--- | :--- | :--- |
| Nombre del taller | `Workshop.name` | Nombre público del taller |
| Dirección | `Workshop.address` | Ubicación física |
| Teléfono | `Workshop.phone` | Contacto |
| Correo electrónico | `Workshop.email` / `AppUser.email` | Login y contacto |
| Horario | `Workshop.schedule` | Horario comercial |
| Límite de vehículos | `Workshop.vehicleLimit` | Capacidad máxima |
| URL foto / logo | `Workshop.photoUrl` | Imagen del taller |
| Nombre completo | `AppUser.fullName` | Responsable de la cuenta |
| Contraseña | `AppUser.passwordHash` | Credencial de acceso |

## Flujo real

1. El componente comprueba que el usuario está autenticado.
2. Llama a `WorkshopService.existsForMechanic(userId)` como failsafe.
3. Si ya existe un taller o una solicitud asociada, redirige a `/home`.
4. Si no existe, pre-rellena `fullName` y `email` desde la sesión.
5. El usuario completa el formulario y selecciona la ubicación en el mapa.
6. El componente envía la solicitud a `WorkshopApplicationApiService.submit()`.
7. El backend guarda una `WorkshopApplication` en estado `PENDING`.

## Backend asociado

- `POST /api/workshop-applications`
- `GET /api/workshops/exists-for-mechanic/{mechanicId}`

## Validaciones visibles en el frontend

- Campos obligatorios completos.
- Coordenadas seleccionadas en el mapa.
- Términos aceptados.
- Límite mínimo de vehículos.

## Diseño

- Usa tarjetas y formularios del sistema global de estilos.
- Incluye un mapa selector de ubicación.
- Muestra un estado de comprobación mientras valida el usuario.

## Observaciones

- Ya no es una simulación frontend-only.
- El flujo real persiste la solicitud y luego depende de la aprobación administrativa.
