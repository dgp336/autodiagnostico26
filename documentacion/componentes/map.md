# Componente de mapa (`MapComponent`)

## Tecnologías

| Tecnología | Versión | Rol |
|---|---|---|
| **Leaflet** | 1.9.x | Motor de mapas interactivo (renderizado de tiles y marcadores) |
| **OpenStreetMap** | — | Proveedor de tiles cartográficos (gratuito, sin API key) |
| **Angular Geolocation API** (`navigator.geolocation`) | — | Captura la posición del usuario a través de `GeolocationService` |

Leaflet se carga de forma **dinámica** (`import('leaflet')`) dentro de `afterNextRender` para evitar errores SSR, ya que la librería accede directamente al DOM del navegador.

---

## Funcionamiento general

### 1. Inicialización

Cuando el componente se monta en el navegador, se importa Leaflet de forma asíncrona y se llama a `initMap()`, que:

1. Crea la instancia del mapa sobre el elemento `#mapContainer` con vista inicial en `[0, 0]` zoom 2.
2. Añade la capa de tiles de OpenStreetMap.
3. Activa el flag `mapReady` (signal interno).
4. Llama a `invalidateSize()` con un pequeño delay para forzar el recálculo de dimensiones una vez el DOM ha terminado de pintarse.

### 2. Geolocalización del usuario

Un `effect` angular observa `GeolocationService.locationState()`. En cuanto hay coordenadas disponibles, se coloca un marcador animado (CSS pulse) en la posición del usuario y el mapa hace zoom a nivel 13.

### 3. Marcadores de talleres

`MapComponent` recibe la lista de talleres como **input** (`workshops: input<Workshop[]>([])`), ya cargada por el componente padre (`TallerComponent`). Un segundo `effect` observa ese input y `mapReady`; cada vez que cambia alguno de los dos, borra los marcadores anteriores y vuelve a dibujarlos.

Al hacer clic en un marcador se emite el output `workshopSelected`, que el padre usa para actualizar el taller seleccionado en su propia lista.

### 4. Comunicación con el padre

```
TallerComponent
  │  [workshops]="workshops()"          → lista ordenada por proximidad
  │  [selectedWorkshop]="selectedWorkshop()"
  │
  └─► MapComponent
        (workshopSelected) ──────────────► selectPreview($event)
```

El componente de mapa **no hace llamadas HTTP** propias; toda la lógica de red reside en `TallerComponent`.

### 5. Ordenación por proximidad

`TallerComponent` calcula la distancia entre el usuario y cada taller mediante la **fórmula de Haversine** (distancia sobre la esfera terrestre, radio = 6 371 km) y expone la lista ya ordenada como un `computed` signal. La ordenación se re-evalúa automáticamente si el GPS actualiza la posición del usuario.
