# Perfil

Esta pantalla agrupa la gestión de datos personales, seguridad y preferencias del usuario.

## Componente principal

- `PerfilComponent` en `frontend/src/app/components/perfil/`

## Qué integra

- subrutas internas con `RouterOutlet`
- navegación a información, seguridad, vehículo y preferencias
- footer compartido
- modal de borrado de cuenta

## Flujo de uso

1. El usuario entra en `/perfil`.
2. El componente muestra un menú lateral o superior con las subsecciones.
3. Cada subvista se carga de forma lazy dentro del `RouterOutlet`.
4. El usuario puede cerrar sesión o borrar su cuenta.

## Backend asociado

- `GET /api/users/{id}`
- `PUT /api/users/{id}`
- `PUT /api/users/{id}/password`
- `POST /api/users/{id}/avatar`
- `DELETE /api/users/{id}`

## Observaciones

- La pantalla reutiliza el mismo estado de sesión que el resto de la aplicación.
- La eliminación de cuenta usa un modal de confirmación antes de llamar al backend.
