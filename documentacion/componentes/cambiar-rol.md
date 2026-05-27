# Cambiar rol

Esta pantalla permite que un usuario normal pase a rol `TALLER` antes de solicitar el alta de su taller.

## Componente principal

- `CambiarRolComponent` en `frontend/src/app/components/cambiar-rol/`

## Flujo de uso

1. El usuario entra en `/cambiar-rol`.
2. El componente comprueba si ya es `TALLER`.
3. Si no lo es, llama a `PUT /api/users/{id}/role` con `{ "role": "TALLER" }`.
4. El backend devuelve el usuario actualizado.
5. El frontend actualiza la sesión local con el nuevo rol.
6. Tras un pequeño retardo redirige a `/registro-taller`.

## Backend asociado

- `PUT /api/users/{id}/role`

## Observaciones

- Es la puerta de entrada al flujo de alta de talleres.
- No crea el taller directamente; solo cambia el rol y prepara el registro.
