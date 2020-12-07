import json

from flask import Flask, Response, request
from flask_cors import CORS

from article import ArticleAnalyzer

app = Flask(__name__)
CORS(app)

@app.route('/api/v1/analyse', methods=['POST'])
def analyse_article():
    url = json.loads(request.data)['url']
    article = ArticleAnalyzer(url=url)
    return Response(json.dumps(article.__dict__))
