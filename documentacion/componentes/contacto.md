# Contacto

Esta pantalla permite contactar con un taller o enviar una solicitud general desde el frontend.

## Componente principal

- `ContactoComponent` en `frontend/src/app/components/contacto/`

## Qué integra

- listado de talleres
- filtro por ubicación
- mapa interactivo
- formulario de contacto

## Flujo de uso

1. El componente carga los talleres disponibles.
2. El usuario puede buscar por dirección o seleccionar uno en el mapa.
3. Si quiere escribir un mensaje, abre el formulario de contacto.
4. El formulario envía el mensaje al backend.
5. En administración, el mensaje puede responderse desde el buzón.

## Backend asociado

- `GET /api/workshops`
- `POST /api/contact`
- `GET /api/admin/contact`
- `POST /api/admin/contact/{id}/reply`

## Observaciones

- Reutiliza la lógica de geolocalización y el mapa para ordenar talleres por cercanía.
- Es una puerta de entrada al contacto con la red de talleres.
