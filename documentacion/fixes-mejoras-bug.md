## Fixes y mejoras Bugs/QoL

### Seguimiento / Chat

* Corregido el renderizado automático del chat de seguimiento para usuarios sin mecánico asignado.
* Eliminado el `redirectTo: 'chat'` que forzaba la carga del componente incluso sin sesión activa.
* Añadida validación de tracking activo antes de mostrar navegación y contenido de seguimiento.
* Mejorada la sincronización visual del chat usando `ChangeDetectorRef`.
* Corregida la actualización automática del componente de chat y badge de mensajes no leídos.
* Mejorado el manejo de errores cuando un usuario no tiene seguimiento activo.

### Talleres

* Puesto mejor el titulo.

### Seccion problemas y UX

* Añadido límite de 250 caracteres en descripción libre de problemas.
* Evitados saltos de línea vacíos/spam en textarea de incidencias.
* Mejoradas ayudas visuales y placeholders para inputs de problemas manuales.
* Sustituidos iconos poco descriptivos de motorización/transmisión por iconografía más clara.

### Footer / Navegación

* Corregido bug donde enlaces del footer redirigían incorrectamente a login.
* Añadidas rutas faltantes para páginas informativas (`privacidad`, `términos`, `FAQ`, etc.).

### Configuración / Build

* Corregido warning de TypeScript 5.6 añadiendo `rootDir` explícito en `tsconfig.spec.json`.
* Limpieza general de navegación, estados y renderizado condicional.
