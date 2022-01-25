import nltk

from flask import Flask, request, jsonify
from flask_cors import CORS

from article.metric import MetricType
from article.meta import get_meta_data
from article.chart import get_pie_chart
from article.keywords import get_keywords
from article.sentence import analyze_sentences
from article.summary import get_summary

nltk.data.path.append("/tmp")
nltk.download("punkt", download_dir="/tmp")

app = Flask(__name__)
CORS(app)

@app.route("/public/v1/analyze-article", methods=["POST"])
def analyze_article():
    data = request.get_json(force=True)
    raw_sentences = data["sentences"]
    full_text = " ".join(raw_sentences)
    
    meta_data = get_meta_data(raw_sentences, full_text)
    keywords = get_keywords(full_text)
    analyzed_sentences = analyze_sentences(raw_sentences)
    summary_sentences = get_summary(full_text)
    metric_pie_charts = get_pie_chart(analyzed_sentences)

    article = {
        "meta": meta_data,
        "keywords": keywords,
        "sentences": analyzed_sentences,
        "summarySentences": summary_sentences,
        "sentimentPieChart": metric_pie_charts[MetricType.Sentiment],
        "subjectivityPieChart": metric_pie_charts[MetricType.Subjectivity],
    }

    return jsonify({ "article": article })
