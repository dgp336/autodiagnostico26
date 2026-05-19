# Registro de Taller

Este componente permite a los nuevos talleres solicitar unirse a la plataforma de AutoDiagnóstico.

## Componentes y Estructura

El componente principal es `RegistroTallerComponent`, ubicado en `frontend/src/app/components/registro-taller/`.

### Campos del Formulario

El formulario recopila información esencial para dar de alta tanto al taller como al usuario administrador del mismo.

| Campo | Entidad Relacionada | Descripción |
| :--- | :--- | :--- |
| **Nombre del taller** | `Workshop.name` | Nombre comercial del establecimiento. |
| **Dirección** | `Workshop.address` | Ubicación física completa. |
| **Teléfono** | `Workshop.phone` | Contacto telefónico del taller. |
| **Correo electrónico** | `Workshop.email` / `AppUser.email` | Email de contacto y login. |
| **Horario** | `Workshop.schedule` | Horas de apertura y cierre. |
| **Límite de vehículos** | `Workshop.vehicleLimit` | Capacidad máxima de vehículos simultáneos. |
| **URL Foto/Logo** | `Workshop.photoUrl` | Enlace a una imagen del taller o logo. |
| **Nombre completo** | `AppUser.fullName` | Nombre del responsable del taller. |
| **Contraseña** | `AppUser.passwordHash` | Credenciales de acceso. |

## Lógica de Funcionamiento

1.  **Validación en tiempo real**: Se validan los campos obligatorios y la coincidencia de contraseñas mediante Angular Signals y Computed properties.
2.  **Simulación de envío**: Actualmente, el componente realiza una simulación de envío (frontend-only) mostrando un spinner de carga y una pantalla de éxito tras 1.2 segundos.
3.  **Integración**: El enlace para acceder a este registro se encuentra en el `Footer` de la aplicación, bajo la sección de "Información".

## Diseño y Estilos

El componente utiliza el sistema de diseño global del proyecto (`styles.css`):
*   **Clases globales**: Reutiliza `.card` para los contenedores y `.btn .btn-primary` para las acciones.
*   **Variables CSS**: Utiliza tokens globales como `--color-primary`, `--spacing-md`, etc.
*   **Responsividad**: Adaptado para dispositivos móviles mediante Media Queries que reorganizan el grid de campos.
