# Introducción de Vehículo

Este componente es el núcleo de la identificación técnica del vehículo en el proceso de diagnóstico.

## Estructura de Componentes

`IntroducirVehiculo` actúa como un orquestador de tres sub-componentes especializados:

1.  **SelectorMarcaModelo**: Gestiona la carga y selección de la marca y el modelo.
2.  **PrecisionBusqueda**: Un indicador visual que muestra qué tan completa es la información proporcionada (Marca -> Modelo -> Detalle).
3.  **DetalleVehiculo**: Permite especificar la variante exacta, motorización, transmisión y año.

## Relación con la Capa MCP (LLM)

La información recopilada por este componente es crucial para el diagnóstico inteligente mediante IA:

*   **Contexto en el Prompt**: Toda la información del vehículo (`brand`, `model`, `engineType`, `transmission`, etc.) se envía al LLM como parte del contexto del diagnóstico.
*   **Capa MCP**: El LLM utiliza herramientas de la capa MCP para consultar catálogos técnicos precisos.
*   **Motorización y Piezas**: Basándose en la **motorización** exacta identificada por este componente, el LLM puede invocar herramientas MCP para filtrar y sugerir las piezas de repuesto específicas que son compatibles con ese vehículo exacto, evitando errores de compatibilidad.

## Reutilización y Flujos

*   **Diagnóstico Anónimo/Usuario**: Se utiliza en el flujo principal para iniciar un diagnóstico.
*   **Mis Vehículos**: Este componente se reutiliza en el apartado "Mis Vehículos" para permitir al usuario registrado añadir un nuevo vehículo a su garaje virtual con la misma precisión técnica.

## Comunicación con otros componentes

Emite eventos (`Output`) hacia el componente padre:
*   `vehicleContextChange`: Notifica cada cambio en la selección del vehículo.
*   `enviar`: Se dispara cuando el usuario confirma la información para proceder al diagnóstico.
