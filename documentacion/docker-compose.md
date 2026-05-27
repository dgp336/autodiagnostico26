# Docker Compose — cómo ejecutar los servicios

Este documento explica el `docker-compose.yml` incluido en la raíz del proyecto y cómo usarlo para levantar los servicios necesarios (MySQL, MCP server, backend y frontend).

## Servicios definidos

- `mysql` (MySQL 8.0)

  - Puerto: `3306:3306`
  - Variables: `MYSQL_ROOT_PASSWORD=root`, `MYSQL_DATABASE=autodiagnostico`
  - Volumen: `mysql_data:/var/lib/mysql`
- `mcp-server`

  - Construye a partir de `./mcp-server`
  - Puerto expuesto: `5005:5005`
  - Provee las tools (ej. `get_candidate_parts`) que consume el backend vía Spring AI MCP client.
- `backend`

  - Construye a partir de `./backend`
  - Puerto host → contenedor: `7777:8081` (accesible en `http://localhost:7777`)
  - Variables de entorno principales (también carga `env_file: .env`):
    - `SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/autodiagnostico?createDatabaseIfNotExist=true`
    - `SPRING_DATASOURCE_USERNAME=root`
    - `SPRING_DATASOURCE_PASSWORD=root`
    - `SPRING_JPA_HIBERNATE_DDL_AUTO=update`
    - `GEMINI_API_KEY=${GEMINI_API_KEY}` (se debe proporcionar en `.env` o en el entorno)
    - `SPRING_AI_MCP_CLIENT_SSE_CONNECTIONS_AUTODIAGNOSTICO_MCP_URL=http://mcp-server:5005`
  - Volúmenes (para facilitar desarrollo/scraper output y assets):
    - `./backend/src/main/resources/scraper-output:/app/scraper-output`
    - `./backend/src/main/resources/logos:/app/logos`
    - `./backend/src/main/resources/models:/app/models`
  - Depende de `mysql` y `mcp-server`.
- `frontend`

  - Construye a partir de `./frontend`
  - Puerto: `80:80` (la app estará disponible en `http://localhost`)
  - Depende de `backend`.

## Volúmenes

- `mysql_data` — volumen Docker para persistencia de la base de datos MySQL.

## Variables de entorno recomendadas

Crea un archivo `.env` en la raíz con al menos las siguientes variables:

```
GEMINI_API_KEY=tu_api_key_de_gemini_o_modelo
# Otras variables si las necesitas
```

Asegúrate de no incluir claves secretas en commits públicos.

## Comandos básicos

Levantar todos los servicios (en background):

```bash
docker compose up -d --build
```

Ver logs de un servicio (por ejemplo backend):

```bash
docker compose logs -f backend
```

Detener y eliminar contenedores (mantiene volúmenes):

```bash
docker compose down
```

Eliminar contenedores y volúmenes:

```bash
docker compose down -v
```

## Notas de desarrollo

- El `backend` está configurado para conectarse al MCP server en `http://mcp-server:5005` dentro de la red Docker; no necesitas cambiar la URL para el entorno Docker Compose.
- Si quieres depurar el backend localmente desde tu IDE (no en contenedor), ajusta `SPRING_AI_MCP_CLIENT_SSE_CONNECTIONS_AUTODIAGNOSTICO_MCP_URL` a `http://localhost:5005` y arranca `mcp-server` localmente.
- Para probar la importación de datos con el runner (CarDataPopulationRunner), monta tu carpeta `scraper-output/Groups` dentro del contenedor `backend` o usa la opción `--rootPath` al iniciar el backend fuera del contenedor.

## Consideraciones de seguridad

- No metas claves en `.env` sin control de acceso.
- En producción, protege el acceso a la base de datos y al MCP con redes privadas o mecanismos de autenticación.

---

Archivos referenciados:

- `docker-compose.yml`
- `mcp-server/src/main/resources/parts-catalog/`
- `backend/src/main/resources/application.properties`
