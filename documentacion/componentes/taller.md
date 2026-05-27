# Talleres

Este componente muestra los talleres disponibles y permite al cliente seleccionar uno para iniciar o continuar su seguimiento.

## Componente principal

- `TallerComponent` en `frontend/src/app/components/taller/`

## Qué muestra

- listado dinámico de talleres desde backend
- dirección
- horario
- ocupación actual
- mecánico asignado
- vehículos en reparación
- filtros por disponibilidad, horario y distancia

## Flujo de uso

1. El componente carga talleres con `WorkshopService.listWorkshops(userId)`.
2. Si el usuario tiene geolocalización disponible, ordena la lista por cercanía.
3. El cliente puede filtrar por ocupación y por talleres abiertos.
4. Al seleccionar un taller, el frontend comprueba que tenga un vehículo personal activo seleccionado.
5. El componente llama a `WorkshopService.selectWorkshop()`.
6. El backend crea o reutiliza la sesión de seguimiento con `sessionUuid`.
7. El usuario navega a `/usuario/seguimiento/detalle`.

## Backend asociado

- `GET /api/workshops`
- `GET /api/workshops/{workshopId}`
- `POST /api/workshops/{workshopId}/select`
- `GET /api/workshops/exists-for-mechanic/{mechanicId}`

## Reglas visuales y de negocio

- Un taller lleno se marca como completo.
- Si ya existe una sesión previa, el usuario puede volver a ella.
- La lista se reordena con la posición del usuario cuando hay geolocalización.
- La selección depende de un vehículo personal guardado previamente.

## Relación con seguimiento

La selección del taller no termina en el listado: genera la sesión de trabajo que después se usa en seguimiento y chat.

## Observaciones

- El componente usa `signals` y `computed` para filtros y ordenación.
- La distancia se calcula con la fórmula de Haversine.
