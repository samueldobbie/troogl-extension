from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/public/v1/analyze-sentences", methods=["POST"])
def analyze_sentences():
    data = request.get_json(force=True)
    sentences = data["sentences"]
    return jsonify({ "sentences": sentences })
