# Sistema Mecánico ↔ Cliente

## Objetivo

Permitir que un mecánico y un cliente compartan un sistema de seguimiento y chat persistente mediante una sesión común (`sessionUuid`).

---

# Arquitectura General

El sistema se basa en una entidad:

```java
TallerAssignment
```

que representa:

- un cliente
- un mecánico
- una sesión de seguimiento
- un UUID compartido para el chat

---

# Flujo Principal

## 1. Asignación de cliente

Cuando un cliente es asignado a un mecánico:

```java
TallerAssignment.builder()
    .tallerId(mechanicId)
    .clientId(clientId)
    .sessionUuid(UUID.randomUUID().toString())
```

Se crea una sesión única de seguimiento.

---

# Persistencia

La conversación NO depende de mensajes.

La conversación depende de:

```txt
sessionUuid
```

guardado en:

```java
TallerAssignment
```

---

# Flujo Mecánico

## Ruta

```txt
/mecanico/seguimiento/chat?clientId=11
```

## Proceso

1. Obtiene `clientId`
2. Llama a:

```txt
/api/mechanic/{mechanicId}/clients
```

3. Encuentra:

```txt
tracking.sessionUuid
```

4. Carga chat con ese UUID.

---

# Flujo Usuario

## Ruta

```txt
/usuario/seguimiento
```

## Proceso

1. Obtiene usuario autenticado
2. Llama:

```txt
/api/mechanic/client/{clientId}/tracking
```

3. Recupera:

```txt
sessionUuid
```

4. Carga exactamente la misma conversación.

---

# Sincronización

Ambos lados usan:

```txt
sessionUuid
```

como clave de conversación.

---

# Persistencia de mensajes

Los mensajes permanecen aunque:

- el usuario cierre sesión
- Angular se reinicie
- el backend reinicie
- el mecánico vuelva más tarde

---

# Restricciones

## Usuario sin asignación

Si no existe:

```java
TallerAssignment
```

entonces:

- NO puede acceder al chat
- frontend muestra:

```txt
No tienes seguimiento activo
```

---

# Ventajas del sistema

- conversaciones persistentes
- arquitectura simple
- desacoplado del login
- UUID único por seguimiento
- múltiples clientes por mecánico
- múltiples seguimientos futuros posibles
