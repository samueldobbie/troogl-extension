
import nltk

from flask import Flask, request, jsonify
from flask_cors import CORS

from article.chart import get_pie_chart
from article.keywords import get_keywords
from article.sentence import analyze_sentences
from article.summary import get_summary

nltk.data.path.append("/tmp")
nltk.download("punkt", download_dir = "/tmp")

app = Flask(__name__)
CORS(app)

@app.route("/public/v1/analyze-article", methods=["POST"])
def analyze_article():
    data = request.get_json(force=True)
    raw_sentences = data["sentences"]
    full_text = "\n".join(raw_sentences)
    
    summary = get_summary(full_text)
    keywords = get_keywords(full_text)
    analyzed_sentences = analyze_sentences(raw_sentences)
    metric_pie_charts = get_pie_chart(analyzed_sentences)

    article = {
        "summary": summary,
        "keywords": keywords,
        "sentences": analyzed_sentences,
        "metric_pie_charts": metric_pie_charts,
    }

    return jsonify({ "article": article })
