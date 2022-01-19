import nltk

from flask import Flask, request, jsonify
from flask_cors import CORS

from textblob import TextBlob

nltk.data.path.append("/tmp")
nltk.download("punkt", download_dir = "/tmp")

app = Flask(__name__)
CORS(app)

@app.route("/public/v1/analyze", methods=["POST"])
def analyze():
    data = request.get_json(force=True)
    sentences = data["sentences"]

    response = []
    for sentence in sentences:
        blob = TextBlob(sentence)

        response.append({
            "sentence": sentence,
            "polarity": blob.sentiment.polarity,
            "subjectivity": blob.sentiment.subjectivity
        })

    return jsonify({ "response": response })
