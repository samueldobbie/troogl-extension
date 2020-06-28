from django.http import HttpResponse

import json
import newspaper

def analyse_article(request, url):
    # Extract article data
    headline, body = extract_article_data_from_url(url)

    # Construct response
    context = {}

    context['headline'] = headline
    context['body'] = body

    return HttpResponse(json.dumps(context))


def extract_article_data_from_url(url):
    '''
    Extact headline and body from specified article URL
    '''

    article = newspaper.Article(url=url)
    article.download()
    article.parse()

    headline = article.title
    body = article.text

    return headline, body