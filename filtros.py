import time
from datetime import datetime


def filtrar_por_dias(eventos: list, dias: int) -> list:
    """Filtra eventos dentro de los próximos N días."""
    ahora  = int(time.time())
    limite = ahora + (dias * 86400)
    return [ev for ev in eventos if ahora < int(ev.get("unixtime", 0)) <= limite]


def filtrar_por_servidor(eventos: list, nombre_servidor: str) -> list:
    """Filtra eventos por nombre de servidor (búsqueda parcial)."""
    if not nombre_servidor:
        return eventos
    busqueda = nombre_servidor.lower()
    return [ev for ev in eventos if busqueda in ev.get("_servidor", "").lower()]


def obtener_servidores_unicos(eventos: list) -> list:
    """Retorna lista de nombres de servidores únicos, ordenada."""
    return sorted(set(ev.get("_servidor", "?") for ev in eventos))


def filtrar_por_texto(eventos: list, texto: str) -> list:
    """Filtra eventos por texto libre en título, servidor o líder."""
    if not texto:
        return eventos
    busqueda = texto.lower()
    return [
        ev for ev in eventos
        if busqueda in ev.get("displayTitle", ev.get("title", "")).lower()
        or busqueda in ev.get("_servidor", "").lower()
        or busqueda in ev.get("leader", "").lower()
    ]


def filtrar_por_fecha(eventos: list, texto: str) -> list:
    """Filtra eventos por fecha exacta. Acepta dd/mm o dd/mm/aaaa."""
    texto = texto.strip()
    if not texto:
        return eventos
    for fmt in ("%d/%m/%Y", "%d/%m"):
        try:
            patron = datetime.strptime(texto, fmt)
            return [
                ev for ev in eventos
                if datetime.fromtimestamp(int(ev.get("unixtime", 0))).strftime(fmt) == patron.strftime(fmt)
            ]
        except ValueError:
            continue
    return eventos
