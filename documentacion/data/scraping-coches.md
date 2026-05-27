# Datos y Scraping de Coches

Esta guía explica los recursos y scripts de scraping incluidos en el proyecto, la estructura de los JSON de salida y cómo importarlos al backend para poblar `Vehicle`, `VehicleModel`, `Engine` y `Product`.

## Contenido relevante

- `data/Scripts/RockAutoScrapping` — scraper Puppeteer que extrae catálogo de RockAuto y genera `vehicles_rockauto.json` en `frontend/src/assets/mocks/`.
- `data/ultimatespecs-first-elements-v1-onlyFirstColumn.json` — ejemplo de fichero con especificaciones extraídas de UltimateSpecs; formato usado por `CarDataPopulationService`.
- `data/PlanAccion.md` — mapeos de marcas y grupos automotrices para normalización.

## RockAuto Scraper (qué hace y cómo usarlo)

Ubicación: `data/Scripts/RockAutoScrapping`.

Dependencias:

```bash
cd data/Scripts/RockAutoScrapping
npm install
```

Ejecutar (ejemplo):

```bash
node index.js "https://www.rockauto.com/es/catalog/audi,2026,a3,2.0l+l4+turbocharged,3458296"
```

Comportamiento notable:

- Usa `puppeteer` para abrir la página y expandir los nodos de catálogo.
- Extrae nodos JSON embebidos (`input[id^="jsn"]`) y tablas de piezas (`listing_data_supplemental`).
- Normaliza marca/modelo/año/motorización y agrupa "Recambios" por `groupname`/`parttype`.
- Escribe el resultado en `frontend/src/assets/mocks/vehicles_rockauto.json`.

Salida: objeto con keys `Marca`, `Modelo`, `Motorización`, `FechaFabricacion`, `Recambios` (cada recambio incluye `Nombre`, `Url`, `Piezas` con `Fabricante`, `NumeroPieza`, `Descripcion`, `Precio`, `Imagen`).

Notas:

- El script corre en modo `headful` por defecto (`headless: false`) para facilitar debugging; se puede ajustar.
- A veces RockAuto cambia su DOM; las reglas de selección y parseo pueden requerir ajustes.

## UltimateSpecs JSON (estructura y uso)

El archivo `data/ultimatespecs-first-elements-v1-onlyFirstColumn.json` es un ejemplo del formato esperado por el pipeline de importación del backend.

Estructura clave (resumida):

- Array raíz. Cada elemento representa una "marca" o conjunto de modelos.
- `models`: array de modelos, cada `model` contiene:
  - `modelName` — nombre base del modelo.
  - `imageUrl` — URL de imagen (opcional).
  - `url` — URL de la ficha en UltimateSpecs.
  - `versions`: array con variantes (cada variante puede representar motorizaciones o años). Cada `version` contiene:
    - `table_versions`: array donde cada objeto representa una ficha técnica (clave→valor). Las claves contienen categorías como `Motores de Gasolina`, `Eléctrico`, `Año`, `Potencia`, etc. El código del backend busca la clave que contiene la categoría de motor para extraer el `modelName` y el `Año`.
    - `specifications`: map con propiedades técnicas (`Batalla:`, `Alto:`, `Largo:`, `Ancho:`, `Peso:`, `Período de producción:`...).
    - `url`: la URL concreta de la ficha.

Cómo lo consume el backend (`CarDataPopulationService`):

- `scanAndPopulate(rootPath)` recorre recursivamente `rootPath` buscando archivos `ultimatespecs-*.json`.
- Para cada archivo detecta la "brand" por el nombre del fichero y asume que el fichero está dentro de una carpeta `Groups/<group>/<files>` — la carpeta padre se usa como `group`.
- Para cada `version.table_versions`:
  - `extractModelName` busca la clave que indica la categoría de motor y toma su valor como nombre del motor/variante.
  - `detectEngineType` busca palabras en las claves (`Gasolina`, `Diesel`, `Eléctrico`, `HEV`, `PHEV`, `REEV`) para asignar `EngineType`.
  - Se crean/actualizan `Engine`, `Vehicle`, `VehicleModel` y se infieren transmisiones con heurísticas.

Campos mapeados (ejemplos):

- `specifications` → `Vehicle`:

  - `Batalla:` → `wheelbase`
  - `Alto:` → `height`
  - `Largo:` → `length`
  - `Ancho:` → `width`
  - `Peso:` → `weight`
  - `Período de producción:` → `periodOfProduction`
  - `Cilindrada:` → `engineDisplacement`
- `table_versions` entry → `VehicleModel` `modelName`, `yearFirstProduction`, vinculado a `Engine` detectado.

## Flujo de importación completo (pasos prácticos)

1. Preparar los JSON de modelos (UltimateSpecs) y los JSON/carParts (RockAuto u otra fuente).
   - Estructura recomendada en disco:
     ```text
     scraper-output/Groups/
       |-- vag/
       |     |-- ultimatespecs-volkswagen.json
       |     |-- parts-volkswagen.json
       |-- toyota/
             |-- ultimatespecs-toyota.json
             |-- parts-toyota.json
     ```
2. Si usas `RockAutoScrapping`, ejecuta `node index.js <rockauto-url>` para generar `vehicles_rockauto.json` y mueve/copia esos JSON a la carpeta del `group` correspondiente.
3. Arrancar el `backend` (por ejemplo `./mvnw spring-boot:run`) sin datos previos (`vehicles/models/engines` vacíos) para que `CarDataPopulationRunner` ejecute `scanAndPopulate(rootPath)` automáticamente.
   - Puedes pasar la opción `--rootPath=/ruta/a/scraper-output/Groups` si no usas la ruta por defecto.
4. Verificar logs: `CarDataPopulationService` registra progreso al cargar modelos y plantillas de producto.
5. Revisa la tabla `product` inicialización: `GeneralPartsInitializer` carga `static/general-car-parts.json` y `static/general-car-parts-*.json` para poblar productos generales.

## Donde colocar los catálogos de piezas (MCP)

- El `mcp-server` carga catálogos desde `classpath:parts-catalog/{ENGINE_TYPE}.json`. Para usar nuevas listas de piezas en el flujo LLM → tool_use, añade archivos `PETROL.json`, `DIESEL.json`, etc. en `mcp-server/src/main/resources/parts-catalog/`.

## Consejos y advertencias

- Normalización: usa `data/PlanAccion.md` para mapear marcas a grupos automotrices y evitar fragmentación de datos.
- Anti-hallucination: el backend valida nombres de piezas contra `product` y registra `unresolved` cuando aparecen nombres no encontrados.
- DOM frágil: scrapers basados en `puppeteer` pueden romperse con cambios en RockAuto o UltimateSpecs; mantén tests de extracción y ejemplos.
- Respeta los términos de servicio y robots.txt de los sitios target. Para recolección masiva considera APIs oficiales o acuerdos.

---

Archivos referenciados:

- `data/Scripts/RockAutoScrapping/index.js`
- `data/ultimatespecs-first-elements-v1-onlyFirstColumn.json`
- `backend/src/main/java/.../service/core/CarDataPopulationService.java`
- `backend/src/main/java/.../service/core/CarDataPopulationRunner.java`
- `backend/src/main/java/.../service/core/GeneralPartsInitializer.java`
