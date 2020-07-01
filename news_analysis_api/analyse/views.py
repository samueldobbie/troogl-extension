from django.http import HttpResponse
import random

from google.cloud import language_v1
from google.cloud.language_v1 import enums
import fake_useragent
import json
import newspaper
import spacy

def analyse_article(request, url):
    '''
    Analyse specified article and return data
    to be displayed by the troogl extension
    '''

    # Extract article data
    body, sentences, sentence_offsets = extract_article_data_from_url(url)

    # Define default entity name
    default_entity_name = 'Everyday News Reader'

    # Get sentence sentiments for all entities (incl. general)
    sentence_sentiment_classes = predict_sentence_sentiment_classes(body, sentence_offsets, default_entity_name)

    # Construct response
    context = {}

    context['sentences'] = sentences
    context['sentence_sentiment_classes'] = sentence_sentiment_classes
    context['default_entity_name'] = default_entity_name

    return HttpResponse(json.dumps(context))


def extract_article_data_from_url(url):
    '''
    Extact headline and body from specified article URL
    '''

    article = newspaper.Article(url=url, config=get_newspaper_configuration())
    article.download()
    article.parse()

    sentences = get_article_sentences(article.text)
    sentences.insert(0, article.title)
    body = ' '.join(sentences)

    sentence_offsets = []
    current_offset = 0
    for sentence in sentences:
        sentence_offsets.append((current_offset, current_offset + len(sentence) - 1))
        current_offset += len(sentence)

    return body, sentences, sentence_offsets


def get_newspaper_configuration():
    '''
    Specify newspaper configuration settings
    '''

    newspaper_configuration.browser_user_agent = user_agent_generator.random
    return newspaper_configuration


def get_article_sentences(text):
    doc = nlp(text)
    return [str(s).strip() for s in doc.sents]


def predict_sentence_sentiment_classes(body, sentence_offsets, default_entity_name):
    '''
    Predict sentiment for each entity within article
    and map to corresponding sentence class 
    '''

    document = {'content': body, 'type': enums.Document.Type.PLAIN_TEXT, 'language': 'en'}
    response = client.analyze_entity_sentiment(document, encoding_type=enums.EncodingType.UTF8)
    
    class_options = ['troogl-negative', 'troogl-positive']

    sentence_sentiment_classes = {}

    # Generate random sentiment classes for default view (temporarily)
    sentence_sentiment_classes[default_entity_name] = []
    for i in range(len(sentence_offsets)):
        sentence_sentiment_classes[default_entity_name].append({
            'sentence_index': i,
            'sentence_class': class_options[random.randint(0, len(class_options) - 1)]
        })

    for entity in response.entities:
        entity_name = entity.name.strip().title()

        if entity.name not in sentence_sentiment_classes:
            sentence_sentiment_classes[entity_name] = []

        for mention in entity.mentions:
            sentence_class = ''
            if mention.sentiment.score < -0.25 and mention.sentiment.magnitude > 0.4:
                sentence_class = class_options[0]
            elif mention.sentiment.score > 0.25 and mention.sentiment.magnitude > 0.4:
                sentence_class = class_options[1]

            if sentence_class != '':
                sentence_index = 0
                for offset_index in range(len(sentence_offsets)):
                    if mention.text.begin_offset >= sentence_offsets[offset_index][0] and mention.text.begin_offset <= sentence_offsets[offset_index][1]:
                        sentence_index = offset_index
                        break

                sentence_sentiment_classes[entity_name].append({
                    'sentence_index': sentence_index,
                    'sentence_class': sentence_class
                })

    # Restrict perspectives to those that include at least one non-neutral sentence
    relevant_sentence_sentiment_classes = {}
    for k, v in sentence_sentiment_classes.items():
        if len(v) > 0 or k == default_entity_name:
            relevant_sentence_sentiment_classes[k] = v

    return relevant_sentence_sentiment_classes

newspaper_configuration = newspaper.Config()
user_agent_generator = fake_useragent.UserAgent()
client = language_v1.LanguageServiceClient.from_service_account_json(r'C:\Users\Samuel\Desktop\Troogl Browser Extension\troogl_extension_env\Troogl Browser Extension\news_analysis_api\ce-v1-f594c3be6fc9.json')
nlp = spacy.load('en_core_web_md')