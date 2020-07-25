from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

import math

from google.cloud import language_v1
from google.cloud.language_v1 import enums

from nltk.tokenize import sent_tokenize

from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

from textblob import TextBlob

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

import fake_useragent
import requests
import json
import newspaper
import spacy

@csrf_exempt
def analyse_article(request):
    '''
    Analyse specified article and return data
    to be displayed by the troogl extension
    '''

    request_body = json.loads(request.body)
    url = request_body['url']

    # Extract core article data from article html or url
    try:
        article_data = extract_article_data(url=url)
    except:
        return HttpResponse(None)

    if article_data is None:
        return HttpResponse(None)

    # Define default entity name
    article_data['default_entity_name'] = 'Everyday News Reader'

    # Get sentence sentiments for all entity perspectives
    try:
        sentence_sentiment_classes, positive_towards, negative_towards = extract_sentiment_data(
            article_data['body'],
            article_data['sentences'],
            article_data['sentence_offsets'],
            article_data['default_entity_name']
        )
    except:
        return HttpResponse(None)

    article_data['sentence_sentiment_classes'] = sentence_sentiment_classes
    article_data['positive_towards'] = positive_towards
    article_data['negative_towards'] = negative_towards

    # Get subjectivity for overall article
    try:
        article_data['subjectivity'] = get_subjectivity_class(article_data['body'])
    except:
        return HttpResponse(None)

    return HttpResponse(json.dumps(article_data))


def extract_article_data(url=None, html=None):
    '''
    Extact core data from specified article
    page html or url
    '''

    # Construct api query
    api_url = 'https://api.diffbot.com/v3/article'
    params = {
        'timeout': 90000,
        'token': DIFFBOT_TOKEN,
        'maxTags': 0,
        'paging': False,
        'discussion': False,
        'X-Forward-User-Agent': user_agent_generator.random,
        'X-Forward-Referer': 'google.com',
        'url': url
    }
    
    # Send query using article url or html
    if url is None:
        headers = {'Content-Type': 'text/html'}
        response = requests.post(url=api_url, params=params, headers=headers, data=html.encode('utf-8'))
    elif html is None:
        response = requests.get(url=api_url, params=params)
    
    response_text = json.loads(response.text)
    response_data = response_text['objects'][0]

    title = ''
    if 'title' in response_data:
        title = response_data['title'].strip()

    text = ''
    if 'text' in response_data:
        text = response_data['text'].strip()

    author = ''
    if 'author' in response_data:
        author = response_data['author'].strip()

    # Parse response data into sentences
    if text != '':
        sentences = get_article_sentences(text, author)
        sentences.insert(0, title)
    else:
        return None

    # Calculate start and end indicies of each sentence within body
    sentence_offsets = get_sentence_offsets(sentences)

    body = ' '.join(sentences)

    # Get neutralized summary of article
    summary_sentences = get_article_summary(body, 'english', 3)

    # Get sentence, word and character counts
    sentence_count = len(sentences)
    word_count = len(body.split(' '))
    character_count = len(body)

    # Get read time of article in minutes and seconds
    read_time = get_read_time(word_count)

    # Get readability level of article
    readability_level = get_readability_level(sentence_count, word_count, character_count)

    # Construct response data
    article_data = {}
    article_data['body'] = body
    article_data['sentences'] = sentences
    article_data['sentence_offsets'] = sentence_offsets
    article_data['summary_sentences'] = summary_sentences
    article_data['read_time'] = read_time
    article_data['readability_level'] = readability_level

    return article_data


def get_article_sentences(text, author):
    # Strip out paragraphs that partially or exactly match defined stopwords
    paragraphs = []
    for paragraph in text.split('\n'):
        valid_paragraph = True
        for partial_stopword in partial_stopwords:
            if partial_stopword.lower() in paragraph.lower() or paragraph.lower().strip() in exact_stopwords:
                valid_paragraph = False
                break
        
        # Ignore sentences that include the authors name
        if author != '' and author.lower() in paragraph.lower():
            valid_paragraph = False 

        if valid_paragraph:
            paragraphs.append(paragraph)

    # Tokenize remaining paragraphs into sentences
    sentences = []
    for paragraph in paragraphs:
        for sentence in sent_tokenize(paragraph):
            sentences.append(sentence.strip())

    return sentences


def get_sentence_offsets(sentences):
    offsets = []
    offset = 0
    for sentence in sentences:
        offsets.append((offset, offset + len(sentence) - 1))
        offset += len(sentence)
    return offsets


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

    # Neutralize bias within summary sentences (to-do)

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


def extract_sentiment_data(body, sentences, sentence_offsets, default_entity_name):
    # Query Google NLP
    document = {'content': body, 'type': enums.Document.Type.PLAIN_TEXT, 'language': 'en'}
    response = client.analyze_entity_sentiment(document, encoding_type=enums.EncodingType.UTF8)

    # Cluster similar entities together
    clustered_response = cluster_response_entities(response)

    # List unwanted entities based on category type
    unwanted_entities = get_unwanted_entities(clustered_response, body)

    # Classify sentiment of sentences from all perspectives
    perspective_data = get_perspective_data(clustered_response, unwanted_entities, default_entity_name, sentences, sentence_offsets)

    # Classify overall sentiment towards entities
    positive_towards, negative_towards = get_overall_perspective_data(clustered_response, unwanted_entities)
    
    return perspective_data, positive_towards, negative_towards


def cluster_response_entities(response):
    '''
    Merge similar entities together, as Google NLP will
    often list two entities seperately even though they
    typically refer to the same entity
    '''

    return response


def get_unwanted_entities(response, body):
    '''
    Get a list of all unwanted entities
    based on target entity types
    '''

    # Get list of target entities
    target_entity_types = ('PERSON', 'ORGANIZATION')
    target_entities = get_entities(body, target_entity_types)

    # Remove unwanted entities
    unwanted_entities = set()
    for entity in response.entities:
        remove_entity = True

        # Check whether entity name or mentions appear in target list
        if entity.name.lower() not in target_entities:
            for mention in entity.mentions:
                if mention.text.content.lower() in target_entities:
                    remove_entity = False
                    break
        else:
            continue

        if remove_entity:
            unwanted_entities.add(entity.name.lower())

    return unwanted_entities


def get_perspective_data(response, unwanted_entities, default_entity_name, sentences, sentence_offsets):
    '''
    Classify sentiment of article sentences
    from all perspectives (default + entity)
    '''
    
    # Define attributes used for adjusting display of sentence within article
    sentence_attribute_options = {
        'classes': ['troogl-negative', 'troogl-positive'],
        'titles': ['Negative', 'Positive'],
        'values': [-1, 1]
    }

    # Classify default and entity sentiments
    default_perspective_data = classify_default_perspective(default_entity_name, sentences, sentence_attribute_options)
    entity_perspective_data = classify_entity_perspectives(response, unwanted_entities, sentence_offsets, sentence_attribute_options)

    # Combine default and entity perspectives
    perspective_data = default_perspective_data.copy()
    perspective_data.update(entity_perspective_data)

    return perspective_data


def classify_default_perspective(default_entity_name, sentences, sentence_attribute_options):
    '''
    Classify sentiment of article sentences
    from default perspective (user's perspective)
    '''
    perspective_data = {default_entity_name: []}
    for sentence_index in range(len(sentences)):
        sentence_sentiment = sentiment_analyzer.polarity_scores(sentences[sentence_index])

        if -sentence_sentiment['neg'] < NEGATIVE_SENTIMENT_THRESHOLD:
            perspective_data[default_entity_name].append({
                'sentence_index': sentence_index,
                'sentence_class_string': sentence_attribute_options['classes'][0],
                'sentence_class_title': sentence_attribute_options['titles'][0],
                'sentence_class_value': sentence_attribute_options['values'][0]
            })
        elif sentence_sentiment['pos'] > POSITIVE_SENTIMENT_THRESHOLD:
            perspective_data[default_entity_name].append({
                'sentence_index': sentence_index,
                'sentence_class_string': sentence_attribute_options['classes'][1],
                'sentence_class_title': sentence_attribute_options['titles'][1],
                'sentence_class_value': sentence_attribute_options['values'][1]
            })

    return perspective_data


def classify_entity_perspectives(response, unwanted_entities, sentence_offsets, sentence_attribute_options):
    '''
    Classify the sentiment for the article sentences from
    the perspective of mentioned people and organizations 
    '''

    perspective_data = {}
    for entity in response.entities:
        entity_name = entity.name.strip().title()

        if entity_name.lower() in unwanted_entities:
            continue

        if entity_name not in perspective_data:
            perspective_data[entity_name] = []

        for mention in entity.mentions:
            # Select attributes for the sentence that mentions the entity
            sentence_class, sentence_title, sentence_value = get_sentence_attributes(mention, sentence_attribute_options)

            # Get the index of the sentence where the entity was mentioned
            sentence_index = get_mention_sentence_index(mention, sentence_offsets)

            if sentence_class != '' and sentence_index != -1:
                perspective_data[entity_name].append({
                    'sentence_index': sentence_index,
                    'sentence_class_string': sentence_class,
                    'sentence_class_title': sentence_title,
                    'sentence_class_value': sentence_value,
                })

    # Ignore perspectives that don't include at least one non-neutral sentence
    updated_perspective_data = {}
    for key, value in perspective_data.items():
        if len(value) > 0:
            updated_perspective_data[key] = value

    # Sort perspectives by count of non-neutral sentences
    sorted(updated_perspective_data, key=lambda k: len(updated_perspective_data[k]), reverse=True)

    return updated_perspective_data


def get_sentence_attributes(mention, options):
    '''
    Select the attributes for the sentence that
    mentions the entity based on the sentiment
    '''
    if mention.sentiment.score < NEGATIVE_SENTIMENT_THRESHOLD and mention.sentiment.magnitude > MAGNITUDE_THRESHOLD:
        return options['classes'][0], options['titles'][0], options['values'][0]
    elif mention.sentiment.score > POSITIVE_SENTIMENT_THRESHOLD and mention.sentiment.magnitude > MAGNITUDE_THRESHOLD:
        return options['classes'][1], options['titles'][1], options['values'][1]
    else:
        return '', '', ''


def get_mention_sentence_index(mention, sentence_offsets):
    '''
    Get the index of the sentence
    where the entity was mentioned
    '''
    for i in range(len(sentence_offsets)):
        if mention.text.begin_offset >= sentence_offsets[i][0] and mention.text.begin_offset <= sentence_offsets[i][1]:
            return i
    return -1


def get_entities(body, target_entity_types):
    '''
    Get list of people and organizations mentioned
    within the article (more accurate than GNLP)
    '''
    document = nlp(body)
    entities = set()
    for entity in document.ents:
        if entity.label_ in target_entity_types:
            entities.add(str(entity.text).lower())
    return entities


def get_overall_perspective_data(response, unwanted_entities):
    '''
    Determine which entities are mentioned
    positively or negatively overall
    '''
    negative_towards = {}
    positive_towards = {}
    for entity in response.entities:
        entity_name = entity.name.strip().title()
        entity_type = enums.Entity.Type(entity.type).name

        if entity_name.lower() in unwanted_entities:
            continue

        if entity.sentiment.magnitude > MAGNITUDE_THRESHOLD and entity.salience > SALIENCE_THRESHOLD:
            if entity.sentiment.score < NEGATIVE_SENTIMENT_THRESHOLD:
                negative_towards[entity_name] = {
                    'type': entity_type
                }
            elif entity.sentiment.score > POSITIVE_SENTIMENT_THRESHOLD:
                positive_towards[entity_name] = {
                    'type': entity_type
                }

    return positive_towards, negative_towards


def get_subjectivity_class(body):
    subjectivity = TextBlob(body).sentiment.subjectivity
    if subjectivity < 0.25:
        return 'Mostly objective'
    elif subjectivity < 0.50:
        return 'Fairly objective'
    elif subjectivity < 0.75:
        return 'Fairly opinionated'
    else:
        return 'Mostly opinionated'


user_agent_generator = fake_useragent.UserAgent()
client = language_v1.LanguageServiceClient.from_service_account_json(r'C:\Users\Samuel\Desktop\Troogl Browser Extension\troogl_extension_env\Troogl Browser Extension\news_analysis_api\ce-v1-f594c3be6fc9.json')
partial_stopwords = set(open('partial_stopwords.txt', encoding='utf-8').read().split('\n'))
exact_stopwords = set(open('exact_stopwords.txt', encoding='utf-8').read().split('\n'))
nlp = spacy.load('en_core_web_md')
sentiment_analyzer = SentimentIntensityAnalyzer()

DIFFBOT_TOKEN = open('diffbot-token.txt', encoding='utf-8').read().strip()
POSITIVE_SENTIMENT_THRESHOLD = 0.15
NEGATIVE_SENTIMENT_THRESHOLD = -0.15
MAGNITUDE_THRESHOLD = 0.2
SALIENCE_THRESHOLD = 0
