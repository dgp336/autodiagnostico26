# feat: implementar flujo de talleres y asignación mecánico-cliente

## Resumen

Este PR implementa el nuevo sistema de talleres, permitiendo a los clientes visualizar talleres disponibles, consultar ocupación, seleccionar un taller y crear automáticamente una sesión de seguimiento con el mecánico asignado.

---

## Funcionalidades implementadas

### Sistema de talleres

* Listado dinámico de talleres desde backend
* Vista detallada de:
  * dirección
  * contacto
  * horario
  * ocupación
  * mecánico asignado
  * vehículos en reparación
* Integración completa frontend ↔ backend

---

## Selección de taller

### Flujo implementado

1. El cliente visualiza talleres disponibles
2. Selecciona un taller
3. Backend crea automáticamente:
   * `TallerAssignment`
   * `sessionUuid`
   * relación mecánico-cliente
4. El usuario es redirigido automáticamente al seguimiento/chat

---

## Persistencia

Cada taller mantiene:

* límite de vehículos
* vehículos activos
* mecánico responsable
* sesiones persistentes de seguimiento

---

## Frontend Angular

### Añadido

* nuevo `TallerComponent`
* render dinámico de talleres
* cálculo de ocupación
* estado visual de talleres completos
* integración de navegación hacia seguimiento

### Mejoras UX

* botón de actualización
* bloqueo de selección en talleres llenos
* recuperación automática de sesiones existentes
* mensajes de error controlados

---

## Backend Spring Boot

### Añadido

* DTOs de talleres
* endpoints de listado y selección
* lógica de asignación mecánico-cliente
* persistencia de `sessionUuid`
* control de capacidad de talleres

---

## Manejo de errores

Soporte para:

* talleres completos
* clientes sin sesión
* errores de asignación
* talleres inexistentes

---

## Resultado

El sistema ahora permite crear flujos completos de asignación entre cliente y mecánico mediante selección de talleres, dejando preparada la integración directa con seguimiento y chat persistente.
