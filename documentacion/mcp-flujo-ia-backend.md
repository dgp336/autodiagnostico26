# MCP: Flujo de IA ↔ Backend

Este documento describe cómo funciona el MCP (Model Callback Provider) en el proyecto, cómo se expone la herramienta de catálogo de piezas y cómo el backend orquesta el flujo de autodiagnóstico usando un LLM.

## Componentes principales

- `mcp-server` (Spring Boot)

  - Expone herramientas (tools) a través del starter `spring-ai-starter-mcp-server-webmvc`.
  - Herramienta principal: `CandidatePartsTool.get_candidate_parts(engineType)`.
  - Carga catálogos de piezas desde `classpath:parts-catalog/{ENGINE_TYPE}.json`.
  - Configuración en `mcp-server/src/main/resources/application.properties`:
    - `spring.ai.mcp.server.enabled=true`
    - `spring.ai.mcp.server.name=autodiagnostico-mcp`
    - `spring.ai.mcp.server.type=async`
- `backend` (Spring Boot)

  - Usa `spring-ai-starter-model-google-genai` para el cliente LLM (Gemini) y
    `spring-ai-starter-mcp-client-webflux` para consumir el MCP remoto.
  - Construye un `ChatClient` con `defaultToolCallbacks(mcpToolCallbackProvider)`
    en `AiConfig` para que el LLM pueda invocar las tools del `mcp-server`.
  - Orquesta el flujo de autodiagnóstico en `AutodiagnosisService`.

## Flujo (resumen)

1. El backend recibe una petición de autodiagnóstico (`AutodiagnosisController`).
2. Resuelve el `VehicleModel` (base de datos) para obtener `engineType` y contexto.
3. Construye el `userPrompt` y llama al LLM mediante `diagnosisChatClient`.
   - El `ChatClient` está configurado con las callbacks del MCP, por lo que
     durante la generación el LLM puede invocar `get_candidate_parts("ENGINE")`.
4. El LLM debe invocar la tool y luego devolver un JSON estricto con diagnóstico
   y el array `selectedPartNames` (reglas definidas en `AutodiagnosisService.SYSTEM_PROMPT`).
5. El backend valida `selectedPartNames` contra la tabla `product` (anti-hallucination).
6. Se devuelve al cliente el `AutodiagnosisResponseDTO` con piezas resueltas y
   una lista de nombres no resueltos (si existieran).

## Reglas importantes (enforceadas)

- El sistema requiere que el LLM invoque `get_candidate_parts(engineType)` ANTES de
  seleccionar piezas. Esto se fuerza en el `SYSTEM_PROMPT` y se comprueba por diseño
  (el backend ignora nombres fuera de la lista devuelta por la tool).
- El JSON de salida del LLM debe tener la forma exacta solicitada por el prompt.
- `selectedPartNames` solo puede contener nombres exactamente iguales a los
  devueltos por la tool — el backend utiliza `productRepository.findByName(...)`
  para validar y enriquecer los resultados.

## Cómo añadir o actualizar catálogos de piezas

1. Añadir un archivo JSON en `mcp-server/src/main/resources/parts-catalog/` llamado
   `ENGINE_TYPE.json` (p. ej. `PETROL.json`, `DIESEL.json`, `BEV.json`).
2. Cada archivo debe ser un array JSON plano con objetos:
   ```json
   [{"name":"Bomba de combustible","description":"...","priceRange":[10,50]}, ...]
   ```
3. Reiniciar `mcp-server` para que `PartsCatalogService` cargue los catálogos.

## Configuración y despliegue

- Docker Compose define la conexión MCP para el backend:
  - Variable: `SPRING_AI_MCP_CLIENT_SSE_CONNECTIONS_AUTODIAGNOSTICO_MCP_URL`
  - En `docker-compose.yml` apunta a `http://mcp-server:5005` cuando se ejecuta
    en el mismo stack.
- Para desarrollo local:
  - Ejecuta el `mcp-server` en `autodiagnostico26/mcp-server`:
    ```bash
    cd autodiagnostico26/mcp-server
    ./mvnw spring-boot:run
    ```
  - Ejecuta el `backend` con la propiedad `spring.ai.mcp.client.sse.connections.autodiagnostico-mcp.url`
    apuntando a `http://localhost:5005` (ya configurado en `application-local.properties`).

## Pruebas y verificación

- Verificar que el MCP arranca y carga catálogos: revisa logs de `PartsCatalogService`.
- Prueba de integración manual:
  1. Enviar una petición de autodiagnóstico al backend (cURL o Postman).
  2. Observar en logs del backend la invocación al LLM y las llamadas a la tool.
  3. Confirmar que `selectedPartNames` son validadas contra la BD y que
     los `unresolved` aparecen si hay nombres no encontrados.

## Consideraciones de seguridad y costes

- Las llamadas al LLM (Gemini/Claude) generan coste por token; controlar
  `temperature`, `max-output-tokens` y batching en `application.properties`.
- Validar entradas del usuario y evitar exponer datos sensibles en prompts.
- El MCP expone una API interna para tools: restringir acceso en producción
  (networking / autenticación) para que solo el backend autorizado lo consuma.

---

Archivos clave referenciados:

- `mcp-server/src/main/java/.../CandidatePartsTool.java`
- `mcp-server/src/main/java/.../PartsCatalogService.java`
- `backend/src/main/java/.../config/AiConfig.java`
- `backend/src/main/java/.../service/autodiagnosis/AutodiagnosisService.java`
- `mcp-server/src/main/resources/parts-catalog/` (JSONs)
- `docker-compose.yml` (variable `SPRING_AI_MCP_CLIENT_SSE_CONNECTIONS_AUTODIAGNOSTICO_MCP_URL`)
