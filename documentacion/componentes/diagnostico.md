# Diagnóstico

Esta pantalla ejecuta el autodiagnóstico con IA y, si el usuario lo confirma, crea el issue de seguimiento.

## Componente principal

- `DiagnosticoComponent` en `frontend/src/app/components/diagnostico/`

## Entrada de datos

Recibe el estado de navegación desde `HomeComponent`:

- vehículo técnico
- síntomas seleccionados
- descripción libre
- `clientId`
- `personalVehicleId`

## Flujo de uso

1. El componente valida que el contexto de navegación exista.
2. Construye un `AutodiagnosisRequest`.
3. Llama a `POST /api/autodiagnosis/diagnose`.
4. Muestra diagnóstico, confianza, explicación y piezas sugeridas.
5. Si el usuario acepta, llama a `POST /api/issues`.
6. Después redirige a `/taller` para elegir taller.

## Backend asociado

- `POST /api/autodiagnosis/diagnose`
- `POST /api/issues`

## Respuesta que maneja

- `diagnosis`
- `confidence`
- `explanation`
- `suggestedParts`
- `unresolvedPartNames`

## Observaciones

- La pantalla no solo muestra el resultado: también puede persistir el issue.
- `sessionUuid` nace en este flujo y después conecta seguimiento y chat.
