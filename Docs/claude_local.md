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

- Comienza siempre leyendo claude_local.md (Normalmente la encontrarás en la carpeta "Docs" de la raíz del proyecto).
- Si claude_local.md tiene señales de estar desactualizado o llevas más de una sesión sin leerlo, verifica también info.md antes de comenzar.

## Preferencias
- La informacion sobre el proyecto siempre la puedes encontrar en la carpeta "Docs" :

    - "Info.md" : tiene la estructura general del proyecto de forma detallada, este es el manual del proyecto. Aqui encontraras todo lo relacionado al proyecto.
    - "< Nombre del proyecto >_arquitectura/project.md" : Tiene la arquitectura que tienes que construir ( si es la primera session tendras que construir la app desde aqui. Tambien te puede servir como guia aparte de info.md en sesiones posteriores)
    - "Claude_local.md" : Es tu MANUAL y el mas importante de todos los archivos . Tiene un resumen breve y simplificado sobre la app, la arquitectura base y los nombres de los archivos que con mas frecuencia se editan debido a su contenido. Aqui pondras cosas como main.py , core.py, config.py , cosas que necesites a la mano cuando tengas que rastrear algun bug de forma rapida dentro de la arquitectura del proyecto para no tener que volver a leer info.md denuevo. Este es tu manual de bolsillo , usalo SIEMPRE para evitar quemar tokens.

---

## Actualización de Docs

### Durante la sesión — después de cada tarea significativa
Después de cada tarea con cambios de código, arquitectura o comportamiento, actualiza los Docs afectados ANTES de continuar con la siguiente tarea. Indica explícitamente: "Docs actualizados: [lista de archivos]"

### Al cierre de sesión — revisión final
Cuando el usuario indique cierre ("NOS DEBEMOS ALGO?", "ESO SERIA TODO", "CON ESTO TERMINAMOS", etc.), revisa todos los archivos en `Docs/` para confirmar que están al día. Si falta algo, actualízalo. Luego haz el commit de cierre.

## Tabla de mapeo — qué cambio actualiza qué archivo

| Si cambió...                                        | Actualiza...                  |
|-----------------------------------------------------|-------------------------------|
| Flujo, dependencias entre módulos, archivos clave   | arquitectura/project.md       |
| Funcionalidad, features, módulos, comportamiento    | info.md                       |
| Archivos que editas frecuentemente o resumen rápido | claude_local.md               |
| Nombre o estructura de carpetas                     | info.md + claude_local.md     |
| Decisión arquitectónica importante                  | arquitectura/project.md       |

---

## Política de commits

Existen **dos tipos de commits** con formatos distintos. No mezclarlos:

### 1. Commit de cierre de sesión (solo Docs)
- Se hace **únicamente al final de la sesión**, después de actualizar los archivos en `Docs/`
- Incluye **solo los archivos de `Docs/`** en el staging
- Formato: `[TIMESTAMP]  <frase breve resumiendo los cambios de la sesión>`
- Ejemplo: `[2025-01-15 18:30]  Añadido sistema de upgrade info y ventana de lista personal`

### Checklist antes de cada commit de código
- [ ] ¿Cambió la arquitectura o el flujo entre módulos? → actualizar `arquitectura/project.md`
- [ ] ¿Cambié, agregué o eliminé una feature o módulo? → actualizar `info.md`
- [ ] ¿Cambió algún archivo que aparece en `claude_local.md`? → actualizar `claude_local.md`

### 2. Commit de proyecto (cambios en el código)
- Feature, bugfix u otro cambio significativo
- Incluye los archivos modificados relevantes (NO los de `Docs/` salvo que sean parte del cambio)
- Formato: detallado y estándar, describiendo qué cambió y por qué
- Sin coautoría en ningún commit

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
| `static/app.js` | Cambios en UI, filtros frontend, auto-reload, detalle de eventos, launchAlarm |
| `static/style.css` | Ajustes visuales |
| `server.py` | Nuevas rutas o cambios en endpoints |
| `config.py` | Si cambian los endpoints de la API de Raid Helper |
| `filtros.py` | Nuevos tipos de filtro |
| `launcher.bat` | Arranque local para pruebas antes de push (activa venv + Flask dev) |

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
- **Integración Alarma Pro:** `launchAlarm(raidId, signup)` en `app.js` dispara `rhv://raid?id=...` + parámetros opcionales de signup (sn/ss/sc). Al embeber JSON en `onclick="..."`, usar siempre `.replace(/"/g, '&quot;')` para no romper el atributo HTML. El toast de confirmación usa `showToast()` + clase `.rhv-toast` en CSS.

---

## Roadmap pendiente

- Exportar evento a ICS (Google Calendar / Outlook)
- Filtro por rol disponible (Tanks, Healers, Melee, Ranged)
- Columnas ordenables
- Mejor soporte móvil
