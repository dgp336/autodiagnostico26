# API Seguimiento y Chat

## Base URL

```txt
/api/mechanic
```

---

# Obtener clientes del mecánico

## Endpoint

```http
GET /api/mechanic/{mechanicId}/clients
```

## Retorna

```json
[
  {
    "clientId": 11,
    "sessionUuid": "uuid"
  }
]
```

---

# Obtener tracking de cliente

## Endpoint

```http
GET /api/mechanic/client/{clientId}/tracking
```

## Uso

Frontend usuario.

---

# Respuesta

```json
{
  "clientId": 11,
  "sessionUuid": "uuid",
  "status": "rojo"
}
```

---

# Si no existe tracking

Retorna:

```http
404 Not Found
```

---

# Actualizar estado cliente

## Endpoint

```http
POST /api/mechanic/{mechanicId}/clients/{clientId}/status
```

## Body

```json
{
  "status": "rojo"
}
```

---

# Actualizar mensaje seguimiento

## Endpoint

```http
POST /api/mechanic/{mechanicId}/clients/{clientId}/tracking-update
```

---

# Chat API

## joinRoom

```http
POST /chat/join
```

---

# listMessages

```http
GET /chat/messages
```

---

# sendMessage

```http
POST /chat/send
```

---

# unreadCount

```http
GET /chat/unread-count
```

---

# Modelos principales

## TallerAssignment

Contiene:

- mechanicId
- clientId
- sessionUuid
- latestUpdate
- status

---

# ChatMessage

Contiene:

- sessionUuid
- senderRole
- commentText
- createdAt

---

# Arquitectura

El backend usa:

- Spring Boot
- JPA/Hibernate
- MySQL
- DTOs
- REST API

---

# Persistencia

La sesión del chat depende de:

```txt
sessionUuid
```

NO del login.
