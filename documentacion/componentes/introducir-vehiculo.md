# Introducción de Vehículo

Este componente centraliza la selección de marca, modelo y detalle técnico del vehículo en los flujos de diagnóstico y alta de vehículos.

## Componente principal

- `IntroducirVehiculo` en `frontend/src/app/components/introducir-vehiculo/`

## Subcomponentes usados

1. `SelectorMarcaModelo`: carga y selección de marca y modelo.
2. `PrecisionBusqueda`: muestra el nivel de completitud de la información.
3. `DetalleVehiculo`: permite elegir variante, motor, transmisión y año.

## Modos de uso

### `diagnostico`

- Se usa en el flujo de autodiagnóstico.
- El usuario debe completar al menos marca y modelo.
- El botón principal emite `enviar` para continuar.

### `alta`

- Se usa en `Mis Vehículos` para registrar un coche en el garaje.
- Incluye matrícula, VIN y fecha de matriculación opcionales.
- El botón principal emite `guardarCoche`.

## Datos que recoge

- `brand`
- `modelId`
- `modelName`
- `variantId`
- `variantName`
- `engineType`
- `transmission`
- `year`

En modo alta también recoge:

- `plate`
- `vin`
- `buildDate`

## Backend asociado

- `GET /api/vehicles/brands`
- `GET /api/vehicles/brands/{brand}/models`
- `GET /api/vehicles/{vehicleId}/variants`
- `POST /api/personal-vehicles`

## Flujo funcional

1. El componente carga marcas al iniciarse.
2. Al elegir marca, carga modelos.
3. Al elegir modelo, carga variantes técnicas.
4. El padre recibe el contexto técnico con `vehicleContextChange`.
5. En diagnóstico, el contexto se envía al motor IA.
6. En alta, el contexto se usa para guardar el vehículo del usuario.

## Integración con diagnóstico

La información técnica se transforma en el `AutodiagnosisRequest` que después consume el backend.

## Integración con `Mis Vehículos`

En modo alta, el componente se reutiliza dentro de `MisVehiculosComponent` para crear un vehículo personal con la misma base técnica.
