import os
from flask import Flask, jsonify
from flask_cors import CORS
from db import init_db

app = Flask(__name__)
CORS(app)

init_db()


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
