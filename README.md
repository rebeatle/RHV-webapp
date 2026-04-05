# RaidHelper Viewer — Webapp

Visualizador web de eventos de [Raid Helper](https://raid-helper.xyz) para Discord. Consolida los eventos de múltiples servidores en una sola tabla, con filtros y detalle de inscripciones.

> Versión desktop (TUI en Python/Textual): [raidhelpercalendar](https://github.com/rebeatle/raidhelpercalendar)

---

## Capturas

<!-- screenshot: vista principal con tabla de eventos -->
<!-- screenshot: modal de detalle de evento con inscripciones -->
<!-- screenshot: wizard de configuración inicial -->
<!-- screenshot: menú de configuración (usuario ya autenticado) -->

---

## Características

- Tabla de eventos futuros unificada de todos tus servidores de Discord
- Filtros locales (período, servidor, búsqueda por texto, fecha) — sin requests adicionales
- Detalle de evento con lista completa de inscripciones agrupadas por rol
- Marca los eventos donde ya estás anotado (requiere User API Key)
- Reintentos silenciosos automáticos para servidores que no respondieron
- Soporte ES / EN
- Las credenciales nunca se almacenan en el servidor — solo en `localStorage`

---

## Stack

- **Backend:** Python 3.11 + Flask
- **Frontend:** Vanilla JS, sin frameworks
- **Deploy:** Railway (Gunicorn)

---

## Credenciales necesarias

| Credencial | Requerida | Para qué sirve |
|---|---|---|
| **Access Token** | Sí | Autenticar con Raid Helper y obtener los eventos |
| **User API Key** | No | Marcar con ✅ los eventos donde ya estás anotado |

Las credenciales se guardan en el `localStorage` del browser. El servidor las recibe en cada request y las descarta inmediatamente — nunca se almacenan.

### Cómo obtener el Access Token

1. Ir a `https://raid-helper.xyz` e iniciar sesión con Discord
2. Abrir el calendario de cualquier servidor
3. Abrir DevTools (`F12`) → pestaña **Network** → filtrar por `Fetch/XHR`
4. Recargar la página (`F5`)
5. Buscar la llamada `events/` → pestaña **Payload**
6. Copiar el valor de `accessToken` (sin comillas)

> El Access Token expira con el tiempo. Si los eventos dejan de cargarse, actualizarlo desde el menú de Configuración.

### Cómo obtener la User API Key

En Discord, enviarle al bot Raid Helper: `/usersettings apikey show`

---

## Correr localmente

```bash
git clone https://github.com/rebeatle/rhv-webapp
cd rhv-webapp
pip install -r requirements.txt
python server.py
```

Abrir `http://localhost:5000` y completar la configuración inicial.

---

## Deploy en Railway

1. Crear un nuevo proyecto en [Railway](https://railway.app) y conectar este repositorio
2. Agregar la variable de entorno `FLASK_SECRET_KEY` con un valor aleatorio seguro
3. Railway detecta el `Procfile` automáticamente y usa `gunicorn server:app`

---

## Estructura

```
rhv-webapp/
├── server.py          # Flask: endpoints /api/verificar, /api/eventos, /api/reintentar, /api/detalle
├── api.py             # Llamadas a la API de Raid Helper
├── config.py          # Constantes de endpoints
├── filtros.py         # Lógica de filtrado
├── lang.py            # Sistema de traducción ES/EN
├── templates/
│   ├── index.html     # App principal
│   └── config.html    # Wizard de configuración + menú de settings
├── static/
│   ├── app.js         # Lógica frontend completa
│   └── style.css      # Dark theme inspirado en Discord
├── Procfile
├── runtime.txt
└── requirements.txt
```

---

## Privacidad

- Las credenciales **nunca** salen del browser salvo en los requests al propio servidor, y el servidor las descarta sin guardarlas
- Variable de entorno en Railway: solo `FLASK_SECRET_KEY`
- No hay base de datos ni logs de usuario
