import nltk

from flask import Flask, request, jsonify
from flask_cors import CORS

from textblob import TextBlob

nltk.data.path.append("/tmp")
nltk.download("punkt", download_dir = "/tmp")

app = Flask(__name__)
CORS(app)

@app.route("/public/v1/analyze-sentences", methods=["POST"])
def analyze_sentences():
    data = request.get_json(force=True)
    sentences = data["sentences"]

    sentence_data = []
    for i, sentence in enumerate(sentences):
        blob = TextBlob(sentence)
        sentiment = getSentimentLabel(blob.sentiment.polarity)
        subjectivity = getSubjectivityLabel(blob.sentiment.subjectivity)

        sentence_data.append({
            "index": i,
            "text": sentence,
            "sentiment": sentiment,
            "subjectivity": subjectivity
        })

    return jsonify({ "data": sentence_data })

def getSentimentLabel(score):
    # TODO RGB scale based on score

    if score <= -0.5:
        label = "negative"
        color = "rgb(255, 193, 193)"
    elif score < 0.5:
        label = "neutral"
        color = "rgb(227, 227, 227)"
    else:
        label = "positive"
        color = "rgb(183, 255, 197)"

    return {
        "score": score,
        "label": label,
        "color": color,
    }

def getSubjectivityLabel(score):
    # TODO RGB scale based on score

    if score <= 0.66:
        label = "objective"
        color = "rgb(227, 227, 227)"
    else:
        label = "subjective"
        color = "rgb(255, 200, 133)"

    return {
        "score": score,
        "label": label,
        "color": color,
    }
