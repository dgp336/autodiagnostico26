# Sistema de Chat

## Objetivo

Sistema de mensajería persistente entre:

- cliente
- mecánico

usando sesiones compartidas.

---

# Conceptos Principales

# Session UUID

Cada conversación usa:

```txt
sessionUuid
```

guardado en:

```java
TallerAssignment
```

---

# Frontend

## Componente principal

```txt
SeguimientoChatComponent
```

Archivo:

```txt
chat.ts
```

---

# Inputs

```ts
@Input() participantIdInput
@Input() sessionUuidInput
```

---

# Modos

## Mecánico

Recibe UUID desde:

```txt
seguimiento.component.ts
```

---

## Usuario

Recupera UUID desde:

```txt
/api/mechanic/client/{id}/tracking
```

y se guarda en:

```txt
localStorage
```

---

# Mensajes

## Backend DTO

```ts
ChatMessageResponse
```

---

# Conversión frontend

Se transforma mediante:

```ts
toViewMessage()
```

para render visual.

---

# Polling

Cada:

```txt
5 segundos
```

se ejecuta:

```ts
fetchNewMessages()
```

---

# Sincronización

El chat:

- carga historial
- recupera mensajes nuevos
- detecta presencia online
- mantiene conversación viva

---

# Restricciones

## Solo mecánico inicia conversación

```ts
canSend
```

evita que el usuario envíe mensajes si el mecánico aún no habló.

---

# Presencia Online

Tabla:

```txt
chat_room_presence
```

guarda:

- usuario conectado
- roomType
- timestamps

---

# Persistencia

Los mensajes NO dependen del frontend.

Toda persistencia ocurre en backend + MySQL.

---

# Flujo de carga

## joinRoom()

↓

## loadMessages()

↓

## polling automático

↓

## render Angular

---

## Notas recientes

- Se han introducido cambios en el manejo de seguimientos y presencia. Ver resumen en: [Seguimientos: sessionUuid y cambios recientes](seguimiento-sessionUuid.md)
- Resumen breve:

  - `sessionUuid` es el identificador canónico del seguimiento.
  - El seed crea `chat_room_presence` para demos y el backend valida presencia antes de `sendMessage`.
  - Las actualizaciones por parte del mecánico deben usar `sessionUuid` (no `clientId`).
