from django.http import HttpResponse

import math
import random

from google.cloud import language_v1
from google.cloud.language_v1 import enums

from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

import fake_useragent
import json
import newspaper
import spacy

def analyse_article(request, url):
    '''
    Analyse specified article and return data
    to be displayed by the troogl extension
    '''

    # Extract article data from specified url
    article_data = extract_article_data_from_url(url)

    # Define default entity name
    default_entity_name = 'Everyday News Reader'

    # Get sentence sentiments for all entity perspectives
    sentence_sentiment_classes = predict_sentence_sentiment_classes(
        article_data['body'],
        article_data['sentence_offsets'],
        default_entity_name
    )

    # Construct response data
    article_data['default_entity_name'] = default_entity_name
    article_data['sentence_sentiment_classes'] = sentence_sentiment_classes

    return HttpResponse(json.dumps(article_data))


def extract_article_data_from_url(url):
    '''
    Extact core data from specified article URL
    '''

    article = newspaper.Article(url=url, config=get_newspaper_configuration())
    article.download()
    article.parse()

    sentences = get_article_sentences(article.text)
    sentences.insert(0, article.title)

    body = ' '.join(sentences)

    # Get neutralized summary of article
    summary_sentences = get_article_summary(body, 'english', 3)

    # Calculate start and end indicies of each sentence within article body
    sentence_offsets = []
    current_offset = 0
    for sentence in sentences:
        sentence_offsets.append((current_offset, current_offset + len(sentence) - 1))
        current_offset += len(sentence)

    # Get sentence, word and character counts
    sentence_count = len(sentences)
    word_count = len(body.split(' '))
    character_count = len(body)

    # Get read time of article in minutes and seconds
    read_time = get_read_time(word_count)

    # Get readability level of article
    readability_level = get_readability_level(sentence_count, word_count, character_count)

    # Construct return data
    article_data = {}
    article_data['body'] = body
    article_data['sentences'] = sentences
    article_data['sentence_offsets'] = sentence_offsets
    article_data['summary_sentences'] = summary_sentences
    article_data['read_time'] = read_time
    article_data['readability_level'] = readability_level

    return article_data


def get_newspaper_configuration():
    '''
    Specify newspaper configuration settings
    '''

    newspaper_configuration.browser_user_agent = user_agent_generator.random
    return newspaper_configuration


def get_article_sentences(text):
    doc = nlp(text)
    return [str(s).strip() for s in doc.sents]


def get_article_summary(text, LANGUAGE, MAX_SUMMARY_SENTENCE_COUNT):
    '''
    Get summary of article and neutralize the biased terms
    '''

    # Get most relevant sentences to describe article
    parser = PlaintextParser.from_string(text, Tokenizer(LANGUAGE))
    stemmer = Stemmer(LANGUAGE)
    summarizer = Summarizer(stemmer)
    summarizer.stop_words = get_stop_words(LANGUAGE)
    summary_sentences = [str(sentence) for sentence in summarizer(parser.document, MAX_SUMMARY_SENTENCE_COUNT)]

    # Neutralize bias within summary sentences

    return summary_sentences


def get_read_time(word_count):
    minutes = int(word_count / 250)
    seconds = int(((word_count / 250) % 1) * 60)
    return {'minutes': minutes, 'seconds': seconds}


def get_readability_level(sent_count, word_count, character_count):
    '''
    Calculate readibility rating of article using
    Automated Readibility Index (ARI) score
    '''

    # Calculate ARI score
    ari_score = math.ceil((4.71 * (character_count / word_count)) +
                          (0.5 * (word_count / sent_count)) - 21.43)

    # Map ARI score to readibility rating
    readability_level = ''
    if ari_score <= 5:
        readability_level = 'Elementary Level'
    elif ari_score <= 8:
        readability_level = 'Middle School Level'
    elif ari_score <= 12:
        readability_level = 'High School Level'
    elif ari_score <= 13:
        readability_level = 'College Level'
    else:
        readability_level = 'Professor Level'

    return readability_level


def predict_sentence_sentiment_classes(body, sentence_offsets, default_entity_name):
    '''
    Predict sentiment for each entity within article
    and map to corresponding sentence class 
    '''

    document = {'content': body, 'type': enums.Document.Type.PLAIN_TEXT, 'language': 'en'}
    response = client.analyze_entity_sentiment(document, encoding_type=enums.EncodingType.UTF8)
    
    class_string_options = ['troogl-negative', 'troogl-positive']
    class_title_options = ['Negative', 'Positive']

    sentence_data = {}

    # Generate random sentiment classes for default view (temporarily)
    sentence_data[default_entity_name] = []
    for i in range(len(sentence_offsets)):
        sentence_data[default_entity_name].append({
            'sentence_index': i,
            'sentence_class_string': class_string_options[random.randint(0, len(class_string_options) - 1)],
            'sentence_class_title': class_title_options[random.randint(0, len(class_title_options) - 1)],
            'sentence_class_value': random.randint(-1, 1)
        })

    for entity in response.entities:
        entity_name = entity.name.strip().title()

        if entity.name not in sentence_data:
            sentence_data[entity_name] = []

        for mention in entity.mentions:
            sentence_class_string = None
            sentence_class_value = None
            if mention.sentiment.score < -0.25 and mention.sentiment.magnitude > 0.4:
                sentence_class_string = class_string_options[0]
                sentence_class_title = class_title_options[0]
                sentence_class_value = -1
            elif mention.sentiment.score > 0.25 and mention.sentiment.magnitude > 0.4:
                sentence_class_string = class_string_options[1]
                sentence_class_title = class_title_options[1]
                sentence_class_value = 1

            if sentence_class_string is not None:
                sentence_index = 0
                for offset_index in range(len(sentence_offsets)):
                    if mention.text.begin_offset >= sentence_offsets[offset_index][0] and mention.text.begin_offset <= sentence_offsets[offset_index][1]:
                        sentence_index = offset_index
                        break

                sentence_data[entity_name].append({
                    'sentence_index': sentence_index,
                    'sentence_class_string': sentence_class_string,
                    'sentence_class_title': sentence_class_title,
                    'sentence_class_value': sentence_class_value,
                })

    # Restrict perspectives to those that include at least one non-neutral sentence
    updated_sentence_data = {}
    for key, value in sentence_data.items():
        if len(value) > 0 or key == default_entity_name:
            updated_sentence_data[key] = value

    return updated_sentence_data

newspaper_configuration = newspaper.Config()
user_agent_generator = fake_useragent.UserAgent()
client = language_v1.LanguageServiceClient.from_service_account_json(r'C:\Users\Samuel\Desktop\Troogl Browser Extension\troogl_extension_env\Troogl Browser Extension\news_analysis_api\ce-v1-f594c3be6fc9.json')
nlp = spacy.load('en_core_web_md')