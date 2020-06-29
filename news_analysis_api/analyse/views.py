from django.http import HttpResponse

import random

import fake_useragent
import json
import newspaper

def analyse_article(request, url):
    '''
    Analyse specified article and return data
    to be displayed by the troogl extension
    '''

    # Extract article data
    headline, body, sentences = extract_article_data_from_url(url)

    # Get general sentence sentiments
    general_sentiment_classes = predict_general_sentiment_classes(sentences)

    # Construct response
    context = {}

    context['headline'] = headline
    context['body'] = body
    context['sentences'] = sentences
    context['general_sentiment_classes'] = general_sentiment_classes

    return HttpResponse(json.dumps(context))


def extract_article_data_from_url(url):
    '''
    Extact headline and body from specified article URL
    '''

    article = newspaper.Article(url=url, config=get_newspaper_configuration())
    article.download()
    article.parse()

    headline = article.title
    sentences = get_article_sentences(article.text)
    sentences.insert(0, headline)
    body = ' '.join(sentences)

    return headline, body, sentences


def get_newspaper_configuration():
    '''
    Specify newspaper configuration settings
    '''

    newspaper_configuration.browser_user_agent = user_agent_generator.random
    return newspaper_configuration


def get_article_sentences(text):
    sentences = text.split('\n')
    return sentences


def predict_general_sentiment_classes(sentences):
    general_sentiment_classes = {}

    class_options = ['troogl-negative', 'troogl-neutral', 'troogl-positive']

    for i in range(len(sentences)):
        general_sentiment_classes[i] = class_options[random.randint(0, 2)]

    return general_sentiment_classes

newspaper_configuration = newspaper.Config()
user_agent_generator = fake_useragent.UserAgent()
