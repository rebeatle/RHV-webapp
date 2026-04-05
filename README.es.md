# Versión en Español

> 🌐 [English version](README.md)

# ⚔ Raid Helper Viewer — Web App

Visualiza todos tus eventos de Raid Helper en múltiples servidores
de Discord desde una sola pantalla, directamente en el navegador.

> Construido por [rebeatle](https://github.com/rebeatle) — porque saltar entre
> 14 canales de Discord para ver el calendario es un raid en sí mismo.

> 🖥️ ¿Preferís la versión de escritorio? → [RaidHelperCalendar](https://github.com/rebeatle/raidhelpercalendar)

---

> ⚠️ **Aviso / Disclaimer**
>
> This is an unofficial, community-built tool. It is not affiliated with,
> endorsed by, or connected to Raid Helper or its developers in any way.
> It uses the same internal API that the raid-helper.xyz frontend uses,
> authenticated with your own personal session. If Raid Helper changes
> their API, this tool may stop working until updated.
>
> Use at your own risk. Your credentials are never stored on the server.

---

## 🌐 Demo en vivo

**[Abrir la app](https://raid-helper-viewer.up.railway.app)**

---

## ¿Qué es esto?

Si usás Raid Helper en varios servidores de Discord, sabés el dolor de tener
que revisar canal por canal para ver qué raids están programadas.

RHV Web resuelve eso: una sola pantalla accesible desde cualquier navegador,
con todos tus eventos futuros, filtros, colores por proximidad de fecha,
y la marca de en cuáles ya estás anotado.

![Main view](screenshots/main_view1.png)
![Main view](screenshots/main_view2.png)
![Configuration](screenshots/config1.png)
![Configuration](screenshots/config2.png)

---

## Características

- 📅 **Vista unificada** de eventos de múltiples servidores
- 🔴🟡🟢 **Colores por proximidad** — hoy, mañana, esta semana
- ✅ **Marca tus eventos** — saber de un vistazo dónde ya estás anotado
- 🔍 **Filtros** por período, servidor, texto libre y fecha exacta
- 📋 **Detalle completo** de cada evento con signups por rol (Tanks, Healers, Melee, Ranged)
- 🔄 **Auto-recarga** cada 5 minutos en segundo plano
- 🔁 **Reintentos automáticos** para servidores que no respondieron al cargar
- 🌐 **Español / Inglés** — cambiable desde la app
- 🔒 **Sin base de datos** — tus credenciales nunca se almacenan en el servidor

---

## Privacidad y seguridad

Tus credenciales **nunca salen de tu navegador** salvo en los requests
al servidor, y el servidor las descarta inmediatamente sin guardarlas.

| Qué | Dónde se guarda |
|-----|-----------------|
| Access Token | Solo en `localStorage` de tu navegador |
| User API Key | Solo en `localStorage` de tu navegador |
| En el servidor | Nada — se descarta tras cada request |

---

## Cómo usarla

### 1. Access Token *(requerido)*

Es tu sesión personal en raid-helper.xyz. Para obtenerlo:

1. Ve a [raid-helper.xyz](https://raid-helper.xyz) e iniciá sesión con Discord
2. Abrí el calendario de cualquier servidor
3. Presioná `F12` para abrir DevTools
4. Ve a la pestaña **Red** (Network) y filtrá por **Fetch/XHR**
5. Recargá la página con `F5`
6. Buscá la llamada **`events/`** → pestaña **Carga útil** (Payload)
7. Copiá el valor de `accessToken` (la cadena larga, sin comillas)

> ⚠️ Este token es personal — no lo compartas con nadie.
> Expira con el tiempo. Si la app deja de mostrar eventos, actualizalo
> desde el menú de Configuración.

### 2. User API Key *(opcional)*

Permite marcar con ✅ los eventos donde ya estás anotado.

En Discord, enviále al bot **Raid Helper** el comando:
```
/usersettings apikey show
```

---

## Colores

| Color | Significado |
|-------|-------------|
| 🔴 Rojo | El evento es hoy |
| 🟡 Amarillo | El evento es mañana |
| 🟢 Verde | El evento es esta semana |
| ⚪ Blanco | El evento es más adelante |

---

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Backend | Python 3.11 + Flask |
| Frontend | Vanilla JS — sin frameworks |
| Deploy | Railway + Gunicorn |
| Estilos | Dark theme inspirado en Discord |

---

## Correr localmente

```bash
git clone https://github.com/rebeatle/rhv-webapp
cd rhv-webapp
pip install -r requirements.txt
python server.py
```

Abrí `http://localhost:5000` en tu navegador y completá la configuración inicial.

---

## Deploy propio en Railway

1. Hacé fork de este repositorio
2. Creá un nuevo proyecto en [Railway](https://railway.app) y conectá tu fork
3. Agregá la variable de entorno `FLASK_SECRET_KEY` con un valor aleatorio seguro
4. Railway detecta el `Procfile` automáticamente — listo

---

## FAQ

**¿Por qué la app no muestra eventos?**
Lo más probable es que tu Access Token haya expirado. Ve al menú de
Configuración y seguí los pasos para obtener uno nuevo.

**¿Por qué no veo el ✅ en mis eventos?**
Necesitás configurar la User API Key desde el menú de Configuración.

**¿Es oficial? ¿Tiene permiso de Raid Helper?**
No es un producto oficial. Usa la misma API que usa el frontend de
raid-helper.xyz con tu sesión personal. Cada usuario autentica con
sus propias credenciales. Si Raid Helper cambia su API, puede dejar
de funcionar hasta que se actualice el proyecto.

**¿Mis datos están seguros?**
Sí. El servidor nunca guarda tus credenciales — las usa para consultar
Raid Helper y las descarta. No hay base de datos ni logs de usuario.

---

## Notas técnicas

RHV replica las llamadas que hace el frontend de raid-helper.xyz usando
el `accessToken` de sesión OAuth de Discord. No existe una API pública
documentada — fue descubierto observando el tráfico de red del sitio oficial.

---

## Roadmap

Funcionalidades planeadas para futuras versiones:

- 📤 **Exportar a ICS** — generar un archivo `.ics` del evento seleccionado
  para importarlo directamente a Google Calendar, Outlook o cualquier
  cliente de calendario.

- 🎯 **Filtro por rol** — ver qué eventos tienen cupo disponible para un
  rol específico (Tanks, Healers, Melee, Ranged), útil para decidir
  dónde anotarse.

- 🔃 **Ordenar columnas** — ordenar la tabla por servidor, cantidad de
  participantes u otros campos haciendo click en el encabezado.

- 📱 **Mejor soporte móvil** — optimizar la vista de tabla para pantallas pequeñas.

---

## Contribuciones

Pull requests bienvenidos. Si algo se rompe por un cambio en la API de
Raid Helper, abrí un issue.

---

## Contacto

Para reportar bugs, sugerencias o uso comercial:
📧 rebeatle.dev@gmail.com

## ☕ Apoyar el proyecto

Si te resulta útil y quieres invitarme un café:

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/rebeatle)
---

## Licencia

Este proyecto está bajo la licencia **GNU GPL v3**.

Podés usar, estudiar y modificar el código libremente, pero cualquier
versión modificada que distribuyas debe:
- Ser también de código abierto bajo GPL v3
- Dar crédito al autor original
- **No puede ser vendida ni usada con fines comerciales** sin permiso explícito del autor

© 2026 [rebeatle](https://github.com/rebeatle) — All rights reserved under GPL v3.

Para uso comercial o acuerdos especiales, contactá al autor directamente.
