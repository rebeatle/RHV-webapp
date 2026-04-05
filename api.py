import requests
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from config import ENDPOINT_AUTH, ENDPOINT_EVENTS, ENDPOINT_AGENDA, ENDPOINT_DETALLE

MAX_WORKERS = 4


def obtener_servidores_usuario(access_token: str) -> list[dict]:
    """Llama a GET /api/auth/{token}. Retorna lista de {id, name, premium}."""
    try:
        res = requests.get(
            ENDPOINT_AUTH.format(access_token=access_token),
            timeout=10
        )
        res.raise_for_status()
        guilds = res.json().get("guilds", [])
        return [
            {
                "id":      str(g["id"]),
                "name":    g.get("name", str(g["id"])),
                "premium": g.get("premium", False),
            }
            for g in guilds
        ]
    except Exception:
        return []


def obtener_eventos_servidor(server_id: str, access_token: str) -> list:
    """Obtiene todos los eventos de un servidor."""
    try:
        res = requests.post(
            ENDPOINT_EVENTS,
            json={"serverid": server_id, "accessToken": access_token},
            timeout=10
        )
        res.raise_for_status()
        return res.json().get("events", [])
    except Exception:
        return []


def obtener_todos_los_eventos(
    servidores: list[dict],
    access_token: str,
    api_key: str | None = None,
) -> tuple[list, list]:
    """Consulta todos los servidores en paralelo. Retorna (eventos, nombres_fallidos)."""
    ahora_unix = int(time.time())
    mi_agenda  = obtener_ids_mi_agenda(api_key)
    todos      = []
    fallidos   = []

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futuros = {
            executor.submit(obtener_eventos_servidor, g["id"], access_token): g
            for g in servidores
        }
        for futuro in as_completed(futuros):
            guild   = futuros[futuro]
            eventos = futuro.result()
            if not eventos:
                fallidos.append(guild["name"])
            for ev in eventos:
                if int(ev.get("unixtime", 0)) > ahora_unix:
                    raid_id         = str(ev.get("raidId", ""))
                    signup_info     = mi_agenda.get(raid_id)
                    signup_list     = (signup_info or {}).get("signUps", [])
                    ev["_servidor"] = guild["name"]
                    ev["_anotado"]  = bool(signup_info)
                    ev["_signup"]   = signup_list[0] if signup_list else None
                    todos.append(ev)

    return sorted(todos, key=lambda x: x["unixtime"]), fallidos


def obtener_ids_mi_agenda(api_key: str | None) -> dict:
    """Retorna dict {raidId: item} de eventos futuros donde el usuario está anotado."""
    if not api_key:
        return {}
    ahora_unix = int(time.time())
    try:
        url = ENDPOINT_AGENDA.format(api_key=api_key)
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        datos = res.json()
        if isinstance(datos, list):
            return {
                str(e["id"]): e
                for e in datos
                if int(e.get("startTime", 0)) > ahora_unix
            }
        return {}
    except Exception:
        return {}


def obtener_detalle_evento(raid_id: str, access_token: str) -> dict:
    """Obtiene el detalle completo de un evento incluyendo signups."""
    try:
        res = requests.post(
            ENDPOINT_DETALLE.format(raid_id=raid_id),
            json={"accessToken": access_token},
            timeout=10
        )
        res.raise_for_status()
        return res.json()
    except Exception:
        return {}
