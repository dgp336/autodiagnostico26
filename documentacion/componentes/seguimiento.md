# Seguimiento

Esta pantalla muestra los seguimientos activos del cliente y abre el detalle y el chat asociados a cada `sessionUuid`.

## Componente principal

- `SeguimientoComponent` en `frontend/src/app/components/seguimiento/`

## Qué hace

- Carga la lista de seguimientos del usuario.
- Mantiene selección por `issueId` o por `sessionUuid`.
- Guarda la sesión activa en `localStorage`.
- Hace refresco automático cada 5 segundos.
- Navega al detalle del seguimiento cuando el usuario selecciona un caso.

## Flujo de uso

1. El guard de seguimiento permite entrar solo si existe un seguimiento válido.
2. El componente llama a `MechanicService.getTrackingsForClient(userId)`.
3. Si hay un seguimiento seleccionado, conserva ese contexto.
4. Si el usuario hace click en un caso, navega al detalle/chat.
5. El componente actualiza la lista periódicamente.

## Backend asociado

- `GET /api/mechanic/client/{clientId}/trackings`
- `GET /api/mechanic/tracking/{sessionUuid}`

## Relación con chat

- El `sessionUuid` se reutiliza para cargar mensajes.
- El chat y el detalle leen la misma sesión.
- El cliente y el mecánico ven el mismo hilo persistente.

## Observaciones

- Esta pantalla es el centro del seguimiento del caso.
- No usa `clientId` como identificador de escritura, solo como filtro de listado.
