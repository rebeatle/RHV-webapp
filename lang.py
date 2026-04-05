import os

_LANG = "es"

STRINGS: dict[str, dict[str, object]] = {
    "es": {
        "token_invalido": "Token inválido o expirado. Verificá tus credenciales.",
        "token_vacio": "El token no puede estar vacío.",
        "datos_incompletos": "Faltan datos en la solicitud.",
        "detalle_no_disponible": "No se pudo obtener el detalle del evento.",
    },
    "en": {
        "token_invalido": "Invalid or expired token. Please check your credentials.",
        "token_vacio": "Token cannot be empty.",
        "datos_incompletos": "Missing data in the request.",
        "detalle_no_disponible": "Could not retrieve event details.",
    },
}


def set_lang(lang: str) -> None:
    global _LANG
    if lang in STRINGS:
        _LANG = lang


def get_lang() -> str:
    return _LANG


def t(key: str, **kwargs) -> str:
    s = STRINGS.get(_LANG, STRINGS["es"]).get(key, key)
    if not isinstance(s, str):
        return str(s)
    return s.format(**kwargs) if kwargs else s
