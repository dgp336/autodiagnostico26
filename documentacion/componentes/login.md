# Login y registro

Este componente unifica inicio de sesión y registro de cuenta en una sola pantalla.

## Componente principal

- `LoginComponent` en `frontend/src/app/components/login/`

## Modos

### `login`

- Pide correo y contraseña.
- Llama a `POST /api/auth/login`.
- Guarda la sesión en `AuthStateService`.

### `register`

- Pide nombre completo, correo, contraseña y rol.
- Llama a `POST /api/auth/register`.
- El rol inicial puede ser `USER`, `TALLER` o `ADMIN`.

## Comportamiento del frontend

- El componente cambia de modo entre `/login` y `/registro`.
- Valida formato de email y contraseña antes de enviar.
- Maneja errores de conflicto cuando el correo ya existe.
- Redirige según el rol recibido del backend.

## Redirecciones

- `USER` → `/home` o `/usuario/seguimiento` si se registró.
- `TALLER` → `/mecanico`.
- `ADMIN` → `/admin`.

## Backend asociado

- `POST /api/auth/login`
- `POST /api/auth/register`

## Datos relevantes

- `AuthUserResponseDTO`
- `AuthUserRole`
- `AuthStateService`

## Observaciones

- Es la puerta de entrada de toda la aplicación.
- De aquí depende el estado de sesión que consumen el header, los guards y el resto de pantallas.
