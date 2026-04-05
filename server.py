import os
from flask import Flask, request, jsonify, render_template

from api import (
    obtener_servidores_usuario,
    obtener_todos_los_eventos,
    obtener_detalle_evento,
)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev-key-change-in-prod")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/config")
def config():
    return render_template("config.html")


@app.route("/api/verificar", methods=["POST"])
def api_verificar():
    data = request.get_json(silent=True) or {}
    access_token = data.get("accessToken", "").strip()
    if not access_token:
        return jsonify({"ok": False, "error": "token_vacio"})
    servidores = obtener_servidores_usuario(access_token)
    if not servidores:
        return jsonify({"ok": False, "error": "token_invalido"})
    return jsonify({"ok": True, "servidores": servidores})


@app.route("/api/eventos", methods=["POST"])
def api_eventos():
    data = request.get_json(silent=True) or {}
    access_token = data.get("accessToken", "").strip()
    api_key      = data.get("apiKey", "").strip() or None
    if not access_token:
        return jsonify({"ok": False, "error": "token_vacio"})
    servidores = obtener_servidores_usuario(access_token)
    if not servidores:
        return jsonify({"ok": False, "error": "token_expirado"})
    eventos, fallidos = obtener_todos_los_eventos(servidores, access_token, api_key)
    return jsonify({"ok": True, "eventos": eventos, "fallidos": fallidos})


@app.route("/api/detalle", methods=["POST"])
def api_detalle():
    data = request.get_json(silent=True) or {}
    access_token = data.get("accessToken", "").strip()
    raid_id      = data.get("raidId", "").strip()
    if not access_token or not raid_id:
        return jsonify({"ok": False, "error": "datos_incompletos"})
    detalle = obtener_detalle_evento(raid_id, access_token)
    if not detalle:
        return jsonify({"ok": False, "error": "detalle_no_disponible"})
    return jsonify({"ok": True, "detalle": detalle})


if __name__ == "__main__":
    app.run(debug=True)
