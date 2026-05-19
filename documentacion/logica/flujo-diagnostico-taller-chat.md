# Flujo Completo de Diagnostico, Taller y Chat

## Objetivo

Este documento explica como funciona el flujo completo de la aplicacion para que el proceso quede estable y entendible de punta a punta:

- seleccion del problema en Home
- registro o reutilizacion del vehiculo
- generacion del diagnostico
- aceptacion explicita del diagnostico
- creacion del Issue antes de elegir taller
- asignacion a taller y mecanico
- chat de seguimiento con `sessionUuid`
- datos demo para probar el flujo sin depender de Gemini

## Idea Principal

La regla central del sistema es esta:

1. Primero se crea un `Issue` en estado borrador o pendiente.
2. Despues se asigna el taller.
3. El chat se cuelga de `sessionUuid`.
4. El `sessionUuid` es la clave comun entre cliente y mecanico.

Esto evita que el flujo dependa del orden incorrecto anterior, donde el Issue se generaba demasiado tarde o quedaba amarrado a la seleccion del taller.

## Flujo Paso a Paso

### 1. Home: seleccion del problema y del vehiculo

El usuario entra a Home, describe el problema y selecciona un coche.

Si no tiene vehiculo guardado, el sistema ahora guarda el primero que introduce para que el flujo no se corte.

Comportamiento clave:

- valida que haya problema y vehiculo
- si no existe coche previo, guarda el nuevo
- pasa `clientId` y `personalVehicleId` al siguiente paso

### 2. Diagnostico: preview primero, aceptar despues

Antes el flujo avanzaba demasiado pronto. Ahora el diagnostico funciona en dos pasos:

1. se muestra una vista previa del diagnostico
2. el usuario pulsa aceptar de forma explicita

Solo al aceptar se persiste la informacion necesaria.

Esto hace el flujo mas claro y evita guardar diagnosticos sin confirmacion del usuario.

### 3. Creacion del Issue antes del taller

El cambio mas importante es que el `Issue` ya no nace al final del proceso.

Ahora se crea antes de seleccionar taller, con la informacion base del problema, las piezas detectadas y el precio estimado.

Beneficios:

- el problema queda guardado aunque el usuario todavia no elija taller
- el flujo del backend queda alineado con el flujo real de negocio
- el chat y el seguimiento pueden usar una referencia estable desde el principio

### 4. Seleccion de taller

Una vez existe el Issue, el usuario elige taller.

En esta fase ya no se crea el caso desde cero; solo se completa la asignacion del taller.

La idea es que el Issue exista primero y luego se asocie al taller correspondiente.

### 5. Session UUID como identidad del seguimiento

Cada seguimiento usa un `sessionUuid` compartido.

Ese UUID se usa para:

- identificar la conversacion
- cargar el historial del chat
- persistir mensajes nuevos
- vincular cliente y mecanico al mismo hilo

La conversacion no depende del frontend ni de la sesion del navegador. Depende de la sesion de seguimiento guardada en backend.

## Backend: piezas importantes

### IssueService

`IssueService` crea el Issue de borrador con los datos del diagnostico.

Responsabilidades:

- validar que el cliente y el vehiculo coinciden
- serializar las piezas detectadas
- estimar precio
- persistir el Issue

### IssueController

Expone el endpoint de creacion del Issue.

El frontend lo usa despues de aceptar el diagnostico.

### IssueSchemaInitializer

Se agrego para permitir que el esquema acepte Issues de borrador antes de tener taller o session asignada.

Esto evita bloqueos de base de datos en el nuevo orden del flujo.

### ChatServiceImpl

Se ajusto para guardar `sessionUuid` en cada mensaje.

Antes habia desajustes entre el hilo visual del chat y la persistencia real; ahora el mensaje siempre queda asociado al seguimiento correcto.

## Frontend: piezas importantes

### Home

Ahora:

- guarda el primer vehiculo si el usuario no tenia ninguno
- valida mejor los campos
- pasa los identificadores necesarios al diagnostico

### Diagnostico

Ahora muestra preview y luego un boton de aceptar.

Esto hace que el usuario confirme la informacion antes de crear definitivamente el caso.

### Chat de seguimiento

El chat usa la ruta y las firmas correctas del backend y trabaja con `sessionUuid`.

Eso corrige:

- el 404 de rutas mal alineadas
- el 500 por mensajes sin `sessionUuid`
- la perdida de sincronizacion entre cliente y mecanico

## Datos Demo para Pruebas

Se agregaron seeds para poder probar el flujo sin depender de Gemini.

### VehiclesSeedInitializer

Se encarga de crear datos minimos de vehiculos y modelos para que los seeds posteriores tengan base real.

### MechanicsDataInitializer

Ahora crea casos demo deterministas con:

- clientes
- vehiculos personales
- issues
- talleres asignados
- `sessionUuid` estable
- primer mensaje de chat

Esto permite comprobar el flujo de seguimiento y chat incluso cuando la parte de IA no esta disponible.

## Sobre el error 429 de Gemini

El error 429 no era un bug de chat.

Era la cuota agotada del modelo Gemini usado en el flujo de diagnostico.

Consecuencia:

- el guardado de diagnosticos con AI puede fallar mientras la cuota este agotada
- el chat y el seguimiento ya se pueden verificar con los datos demo sembrados

## Flujo de Chat

El chat funciona asi:

1. se entra al seguimiento desde cliente o mecanico
2. se recupera el `sessionUuid`
3. se cargan mensajes previos
4. se sincronizan mensajes nuevos
5. se guarda la presencia en la sala

El chat persistente ya no depende de que el frontend mantenga estado en memoria.

## Resultado Esperado

Con este flujo, el sistema queda asi:

- el usuario registra o reutiliza su coche
- el usuario describe el problema
- el diagnostico se previsualiza y luego se acepta
- el Issue se crea antes del taller
- el taller se asigna despues
- cliente y mecanico comparten `sessionUuid`
- el chat persiste aunque se reinicie el frontend
- existen datos demo para probar el recorrido sin Gemini

## Orden de Dependencias

El orden correcto de arranque de datos es:

1. modelos y vehiculos base
2. clientes y talleres
3. vehiculos personales
4. Issues demo
5. mensajes iniciales de chat

Ese orden garantiza que los seeds no fallen por dependencias faltantes.

## Resumen Corto

El flujo correcto ya no es "taller primero y luego problema".

Ahora es:

1. problema y vehiculo
2. diagnostico
3. aceptacion
4. creacion del Issue
5. seleccion de taller
6. seguimiento por chat con `sessionUuid`

Ese cambio es el que hace que el proceso vaya bien y que el chat tenga una base estable para cliente y mecanico.