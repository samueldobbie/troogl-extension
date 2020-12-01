import json

from flask import Flask, Response, request
from flask_cors import CORS

from article import Article

app = Flask(__name__)
CORS(app)

@app.route('/api/v1/analyse', methods=['GET'])
def analyse_article():
    article_url = json.loads(request.data)['url']
    article = Article(url=article_url)
    article.extract_content()
    article.analyse_content()
    return Response(json.dumps(article.__dict__))
