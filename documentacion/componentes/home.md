# Inicio

Esta pantalla es el punto de entrada del usuario normal para el flujo de diagnóstico y alta de vehículos.

## Componente principal

- `HomeComponent` en `frontend/src/app/components/home/`

## Qué integra

- `IntroducirVehiculo`
- `SeleccionaProblema`
- `SelectorMisVehiculos`

## Qué hace

- Permite seleccionar un vehículo técnico o uno guardado en el garaje.
- Recoge síntomas y descripción libre del problema.
- Prepara el estado de navegación que después consume la pantalla de diagnóstico.
- Permite guardar un coche nuevo en el garaje desde el mismo flujo.

## Flujo de uso

1. El componente comprueba el rol del usuario.
2. Si es `TALLER` redirige a `/mecanico`.
3. Si es `ADMIN` redirige a `/admin`.
4. Si es usuario normal, carga sus vehículos personales.
5. El usuario puede seleccionar un coche guardado o construir el contexto técnico manualmente.
6. Al pulsar enviar, se navega a `/diagnostico` con el estado del vehículo y los síntomas.

## Backend asociado

- `GET /api/personal-vehicles?ownerId={ownerId}`
- `POST /api/personal-vehicles`
- `GET /api/vehicles/brands`
- `GET /api/vehicles/brands/{brand}/models`
- `GET /api/vehicles/{vehicleId}/variants`

## Observaciones

- Es la pantalla que conecta el catálogo técnico con el autodiagnóstico.
- También funciona como punto de selección del vehículo personal activo.
