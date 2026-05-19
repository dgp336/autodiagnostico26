# Selección de Problema

Componente diseñado para capturar de forma estructurada los síntomas que presenta el vehículo.

## Funcionamiento Técnico

El componente `SeleccionaProblema` permite al usuario navegar por categorías de problemas comunes y describir su situación personal.

### Categorización

Los problemas están organizados en categorías lógicas (Motor, Frenos, Electricidad, etc.), cada una con su icono descriptivo y una lista de síntomas predefinidos.

### Lógica de Selección

*   **Selección Múltiple**: El usuario puede marcar varios problemas predefinidos.
*   **Descripción Libre**: Se incluye un área de texto para que el usuario detalle el problema con sus propias palabras (limitado a 250 caracteres).
*   **Validación Visual**: Las categorías que contienen problemas seleccionados se resaltan visualmente para ayudar al usuario a revisar su selección.

## Comunicación en el Sistema

Este componente se comunica principalmente con `IntroducirVehiculo` y el componente de Diagnóstico principal:

1.  **Estado de Diagnóstico**: Emite el evento `problemaChange` cada vez que el usuario modifica su selección o descripción.
2.  **Validación de Envío**: Otros componentes (como `IntroducirVehiculo`) consumen el estado de este componente para habilitar o deshabilitar el botón de "Enviar diagnóstico". Si no hay ningún problema seleccionado o descrito, el sistema solicita al usuario que indique uno antes de proceder.
3.  **Input para el LLM**: La selección de problemas y la descripción libre se concatenan con la información del vehículo para formar la consulta que se enviará al modelo de lenguaje para el autodiagnóstico.
