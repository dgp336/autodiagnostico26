# Mis vehículos

Esta pantalla permite ver, añadir y eliminar vehículos personales del usuario.

## Componente principal

- `MisVehiculosComponent` en `frontend/src/app/components/mis-vehiculos/`

## Qué hace

- Lista los vehículos del usuario autenticado.
- Permite abrir el formulario de alta.
- Reutiliza `IntroducirVehiculo` en modo `alta`.
- Guarda el coche en el garaje del usuario.
- Permite eliminar vehículos del listado.
- Usa un vehículo guardado como contexto para el diagnóstico.

## Flujo de uso

1. El componente carga los vehículos del usuario con `listByOwner()`.
2. Si el usuario añade uno nuevo, el subcomponente emite `guardarCoche`.
3. El backend persiste el vehículo y la vista se actualiza.
4. Al diagnosticar un vehículo, el componente navega a `/home` con `personalVehicleId`.

## Backend asociado

- `GET /api/personal-vehicles?ownerId={ownerId}`
- `POST /api/personal-vehicles`
- `DELETE /api/personal-vehicles/{id}?ownerId={ownerId}`

## Observaciones

- Es la base del garaje personal del usuario.
- El vehículo seleccionado aquí puede reutilizarse en diagnóstico y seguimiento.
