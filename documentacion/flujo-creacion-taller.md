# Flujo de creación de taller para un Usuario Normal

Este documento describe el flujo completo que sigue un usuario registrado en AutoDiagnóstico con rol `USER` para convertirse en un usuario con rol `TALLER` (Mecánico) y poder dar de alta su propio taller en el sistema.

## 1. Cambio de Rol (De Usuario a Mecánico)

1. El usuario inicia sesión en la plataforma y se dirige a cualquier vista de la aplicación.
2. En el **footer**, observa un enlace especial en la sección de información: *"¿Eres mecánico? Trabaja con nosotros"*. Este enlace es exclusivo para usuarios con rol `USER`.
3. Al hacer clic, navega a la vista `/cambiar-rol`.
4. En esta vista se le presentan los beneficios de unirse a la red de mecánicos asociados de AutoDiagnóstico.
5. El usuario hace clic en el botón **"Convertir mi cuenta a Mecánico"**.
6. El frontend llama al endpoint `PUT /api/users/{id}/role` enviando `{ "role": "TALLER" }`.
7. El backend valida y actualiza el rol en la base de datos de manera instantánea.
8. El usuario recibe confirmación visual de que su cuenta ha sido mejorada, su sesión local se actualiza a `TALLER`, y es redirigido automáticamente a la vista de `/registro-taller`.

## 2. Registro de Taller (Solicitud)

1. En la vista `/registro-taller`, el usuario rellena el formulario con los detalles del taller y los datos de una nueva cuenta.
2. Usando el **Mapa Selector de Ubicación**, el usuario hace clic para fijar la latitud y longitud exactas donde está ubicado su taller físico.
3. Al enviar, la información viaja al endpoint `POST /api/workshop-applications`.
4. El backend verifica que el correo no esté registrado previamente. Si ya existe, se rechaza la petición.
5. Si pasa las validaciones, la solicitud queda registrada en la base de datos en estado `PENDING`.

## 3. Aprobación y Creación del Taller

1. Un administrador (o proceso automatizado en desarrollo) recupera las solicitudes pendientes mediante `GET /api/workshop-applications/pending`.
2. Al revisar que todo es correcto, ejecuta el endpoint `POST /api/workshop-applications/{id}/approve`.
3. El sistema procesa la aprobación:
   - Identifica que ya existe una cuenta de usuario con el correo de la solicitud.
   - Realiza un segundo check del **Failsafe** para asegurarse de que este mecánico no haya conseguido un taller asociado por otra vía mientras la solicitud estaba pendiente.
   - Crea un nuevo registro en la tabla `Workshop` asignándole el `mechanic_id` del usuario existente y copiando toda la información del formulario (incluida la latitud y longitud).
   - Actualiza la solicitud a estado `APPROVED`.
4. A partir de este momento, el taller del mecánico estará visible en el mapa general para todos los clientes, quienes podrán seleccionarlo para futuras reparaciones.
