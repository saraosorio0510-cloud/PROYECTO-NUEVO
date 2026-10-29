# EventPass — Educación

Frontend de EventPass para explorar talleres, charlas y experiencias educativas. La interfaz está construida con React + Vite y preparada para conectarse a los webhooks de n8n. La categoría principal es educación y el catálogo de demostración distribuye sus actividades entre tecnología, emprendimiento, idiomas, educación financiera y cultura.

## Estructura

- `frontend/`: aplicación React + Vite.
- `frontend/src/App.jsx`: interfaz, filtros, catálogo y detalles de evento.
- `frontend/src/styles.css`: estilos adaptables a móvil y escritorio.
- `n8n/`: workflows exportados del proyecto, incluido WF11.
- `docs/`: documentación adicional del proyecto.
- `.env.example`: nombres de variables para conectar el frontend con n8n.

## Ejecutar localmente

1. Instala Node.js LTS desde el sitio oficial.
2. Abre una terminal dentro de `frontend/`.
3. Ejecuta `npm install` para descargar React y Vite.
4. Ejecuta `npm run dev` y abre la dirección local que muestra Vite.
5. Copia `frontend/.env.example` como `frontend/.env.local`. `VITE_N8N_CHECKIN_URL` apunta al webhook de WF11; puedes cambiarlo para otra instancia.

La vista actual usa eventos de demostración. El registro, inicio de sesión y las inscripciones muestran mensajes informativos hasta que se conecten los workflows reales. Para publicar en Vercel, importa el repositorio y selecciona `frontend/` como **Root Directory**. Después se agregarán allí las variables de entorno de producción. Los valores secretos no deben guardarse en el repositorio.

## Examen — Check-in digital

EventPass incorpora un formulario de check-in en la sección **Check-in** de la página. Envía `inscripcion_id` y `evento_id` por HTTP al webhook `POST /webhook/ep11/checkin` de n8n y presenta mensajes diferenciados para `EXITOSO`, `DUPLICADO` y `RECHAZADO`.

WF11 valida que existan la inscripción y el evento, que correspondan entre sí, que la inscripción esté `CONFIRMADA` y que no exista un check-in exitoso previo. Registra cada intento en el documento independiente **EP11_Checkin**, pestaña `Checkins`, con las columnas `checkin_id`, `inscripcion_id`, `evento_id`, `usuario_id`, `fecha_checkin`, `resultado` y `detalle`. Los resultados admitidos son `EXITOSO`, `RECHAZADO` y `DUPLICADO`. Cuando el intento es válido, cambia únicamente esa inscripción de `CONFIRMADA` a `ASISTIO` y llama al workflow central WF09 para Gmail y Telegram.

La comprobación de duplicados usa el historial EP11 y el estado `ASISTIO`. Las solicitudes secuenciales se identifican como duplicadas y no repiten la actualización ni la notificación. Google Sheets no proporciona una operación atómica para bloquear dos solicitudes simultáneas; para concurrencia estricta se requiere serializar WF11 o usar una base de datos con índice único.

### Petición y respuesta

```json
{"inscripcion_id":"INS-123","evento_id":"EVT-001"}
```

Respuesta exitosa HTTP 200: `{"ok":true,"resultado":"EXITOSO","mensaje":"Check-in registrado",...}`. Un reintento devuelve `DUPLICADO` y HTTP 409. Los casos inválidos devuelven `RECHAZADO` con HTTP 400, 404 o 409 y un mensaje explicativo.

### Archivos y configuración

- `n8n/WF11_checkin_digital.json`: exportación del workflow.
- `n8n/EP11_Checkin_Checkins.csv`: encabezados para la hoja requerida.
- `frontend/src/App.jsx`: formulario integrado en la aplicación.
- `frontend/src/styles.css`: estilos adaptables de la nueva sección.
- `VITE_N8N_CHECKIN_URL`: URL configurable del webhook (el valor por defecto apunta a la instancia de EventPass).

En la instancia EventPass, WF11 y WF09 están publicados y el webhook de producción está habilitado. No se envió una solicitud de check-in real con una inscripción de producción, para evitar actualizar una asistencia y contactar a un asistente durante la verificación. El cambio a `ASISTIO` y las notificaciones reales requieren un check-in válido. No se reemplazaron workflows existentes.
