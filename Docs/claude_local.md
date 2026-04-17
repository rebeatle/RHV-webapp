## Idioma
Siempre responde en español.

## Estilo de código
- Python como lenguaje principal (A menos que se trabaje explicitamente en otros lenguajes)
- Comentarios en español
- Código limpio con manejo de errores
- Estructura modular

## Contexto
- OS: Windows 10
- Editor: VS Code / PyCharm

## Instrucciones Entre sesiones

- Comienza siempre leyendo claude_local.md (Normalmente la encontraras en la carpeta "Docs" de la raiz del proyecto)

## Preferencias
- La informacion sobre el proyecto siempre la puedes encontrar en la carpeta "Docs" :

    - "Info.md" : tiene la estructura general del proyecto de forma detallada, este es el manual del proyecto. Aqui encontraras todo lo relacionado al proyecto.
    - "< Nombre del proyecto >_arquitectura/project.md" : Tiene la arquitectura que tienes que construir ( si es la primera session tendras que construir la app desde aqui. Tambien te puede servir como guia aparte de info.md en sesiones posteriores)
    - "Claude_local.md" : Es tu MANUAL y el mas importante de todos los archivos . Tiene un resumen breve y simplificado sobre la app, la arquitectura base y los nombres de los archivos que con mas frecuencia se editan debido a su contenido. Aqui pondras cosas como main.py , core.py, config.py , cosas que necesites a la mano cuando tengas que rastrear algun bug de forma rapida dentro de la arquitectura del proyecto para no tener que volver a leer info.md denuevo. Este es tu manual de bolsillo , usalo SIEMPRE para evitar quemar tokens.

    # Nota importante sobre DOCS

    - Al final de cada sesion el usuario dira algo como : " ESO SERIA TODO POR ESTA SESION " O " CON ESTO TERMINAMOS POR HOY " o similares.  ES TU OBLIGACION  actualizar y editar todos los archivos dentro de "docs" con los nuevos cambios que se hayan realizado ( si fuera necesario ), asi la siguiente sesion tendras toda la informacion y la arquitectura al dia.

    ## Política de commits

    Existen **dos tipos de commits** con formatos distintos. Es importante no mezclarlos:

    ### 1. Commit de cierre de sesión (solo Docs)
    - Se hace **únicamente al final de la sesión**, después de actualizar los archivos en `Docs/`
    - Incluye **solo los archivos de `Docs/`** en el staging
    - Formato del mensaje: `[TIMESTAMP]  <frase breve resumiendo los cambios de la sesión>`
    - Ejemplo: `[2025-01-15 18:30]  Añadido sistema de upgrade info y ventana de lista personal`

    ### 2. Commit de proyecto (cambios en el código)
    - Se hace cuando se completa una feature, bugfix u otro cambio significativo en el código
    - Incluye los archivos modificados relevantes (NO los de `Docs/` salvo que sean parte del cambio)
    - Formato del mensaje: detallado y estándar, describiendo qué cambió y por qué
    - Ejemplo: `Fix: corregir EnableMouse en textura del icono de alerta (BisRaidAlert_UI.lua)`

    > **Regla clave**: Los commits de `Docs/` son ligeros (timestamp + frase). Los commits de código son descriptivos y detallados. Nunca pongas coautoría en ningún commit.

    Al final de la sesión respóndele al usuario qué archivos actualizaste dentro de `docs` (sin indicar el contenido) y confirma que ya hiciste el commit de cierre. Después el usuario puede cerrar el terminal.

- Explica los cambios que haces antes de hacerlos.
- Si hay varias formas de resolver algo, menciónalas antes de elegir.
- Si tienes dudas o hay ambiguedad en lo que se tiene que decir, dilo explicitamente antes de hacer nada.
- Avisa si algo puede romper código existente.
- En los commits no pongas co autoria.
- Crea siempre el repositorio git y variables de entorno antes de comenzar un proyecto y despues de realizar cambios (commits).
- Crea siempre entorno virtuales antes de comenzar un proyecto, si un proyecto ya esta empezado y no ves variables de entorno , crealos de forma proactiva.

---

## Resumen del proyecto — RHV Web App

**Nombre:** Raid Helper Viewer — Web App
**Descripción:** Dashboard web que unifica todos los eventos de Raid Helper de múltiples servidores de Discord en una sola pantalla.
**Deploy:** Railway + Gunicorn → https://raid-helper-viewer.up.railway.app
**Stack:** Python 3.11 + Flask (backend) · Vanilla JS (frontend) · Dark theme inspirado en Discord

---

## Arquitectura base

```
rhv-webapp/
├── server.py          ← Entrada Flask, rutas API y render de templates
├── api.py             ← Lógica de negocio: llamadas a Raid Helper API (paralelas con ThreadPoolExecutor)
├── config.py          ← Endpoints de la API de Raid Helper (4 constantes)
├── filtros.py         ← Funciones de filtrado de eventos (días, servidor, texto, fecha)
├── lang.py            ← Internacionalización (ES/EN)
├── templates/
│   ├── index.html     ← Vista principal con tabla de eventos
│   └── config.html    ← Pantalla de configuración (tokens)
├── static/
│   ├── app.js         ← Toda la lógica frontend (filtros, carga, detalle, auto-reload)
│   └── style.css      ← Estilos dark theme
├── requirements.txt
├── Procfile           ← web: gunicorn server:app
├── runtime.txt        ← python-3.11.x
├── Docs/
│   └── claude_local.md  ← Este archivo
└── venv/              ← Entorno virtual (no commitear)
```

---

## Archivos que se editan con más frecuencia

| Archivo | Motivo |
|---------|--------|
| `api.py` | Cambios en lógica de consulta a Raid Helper, procesamiento de eventos |
| `static/app.js` | Cambios en UI, filtros frontend, auto-reload, detalle de eventos |
| `static/style.css` | Ajustes visuales |
| `server.py` | Nuevas rutas o cambios en endpoints |
| `config.py` | Si cambian los endpoints de la API de Raid Helper |
| `filtros.py` | Nuevos tipos de filtro |

---

## Variables de entorno necesarias

| Variable | Descripción |
|----------|-------------|
| `FLASK_SECRET_KEY` | Clave secreta de Flask (requerida en producción) |

---

## Notas técnicas importantes

- La API de Raid Helper **no es pública ni documentada** — fue reverse-engineered del tráfico de red del sitio oficial.
- Las credenciales del usuario (accessToken, apiKey) **nunca se almacenan en servidor** — se usan por request y se descartan.
- Los eventos se consultan en paralelo con `ThreadPoolExecutor(max_workers=4)`.
- El frontend guarda credenciales en `localStorage` del navegador.
- Si Raid Helper cambia su API, los endpoints están centralizados en `config.py`.

---

## Roadmap pendiente

- Exportar evento a ICS (Google Calendar / Outlook)
- Filtro por rol disponible (Tanks, Healers, Melee, Ranged)
- Columnas ordenables
- Mejor soporte móvil
