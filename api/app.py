from google.cloud import language
from google.cloud.language import enums
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
from nltk.tokenize import sent_tokenize
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from flask import Flask, Response, request
from flask_cors import CORS

import json
import math
import newspaper
import requests
import spacy

app = Flask(__name__)
CORS(app)

@app.route('/v1/api/analyse', methods=['POST'])
def analyse_article():
    '''
    Analyse article and return JSON response
    '''
    # Extract core article data
    article = get_article_data(json.loads(request.data)['html'])

    if not article:
        return Response(json.dumps(None))

    # Define default entity perspective name
    article['default_entity_name'] = 'Everyday News Reader'

    # Get sentence sentiments for all entity perspectives
    sentence_sentiment_classes, positive_towards, negative_towards = get_sentiment_data(
        article['body'],
        article['sentences'],
        article['sentence_offsets'],
        article['default_entity_name']
    )
    article['sentence_sentiment_classes'] = sentence_sentiment_classes
    article['positive_towards'] = positive_towards
    article['negative_towards'] = negative_towards

    # Get subjectivity for overall article
    article['subjectivity'] = get_subjectivity_class(article['body'])

    return Response(json.dumps(article))


def get_article_data(html):
    '''
    Extact data from article html
    '''
    # Extract article content and split into sentences
    sentences = get_article_sentences(html)

    if not sentences:
        return None

    # Calculate start and end indicies of each sentence
    sentence_offsets = get_sentence_offsets(sentences)

    # Get body and summary of article
    body = ' '.join(sentences)
    summary_sentences = get_article_summary(body, 3)

    # Get sentence, word and character counts
    sent_count = len(sentences)
    word_count = len(body.split(' '))
    char_count = len(body)

    # Get read time of article in minutes and seconds
    read_time = get_read_time(word_count)

    # Get readability level of article
    readability_level = get_readability_level(sent_count, word_count, char_count)

    # Construct response data
    article = {}
    article['body'] = body
    article['sentences'] = sentences
    article['sentence_offsets'] = sentence_offsets
    article['summary_sentences'] = summary_sentences
    article['read_time'] = read_time
    article['readability_level'] = readability_level

    return article


def get_article_sentences(html):
    '''
    Extract and tokenise article into sentences
    '''
    # Extract article content
    title, text = get_article_content(html)

    # Get valid paragraphs
    paragraphs = [p for p in text.split('\n')]

    # for paragraph in text.split('\n'):
    #     valid_paragraph = True
    #     for partial_stopword in partial_stopwords:
    #         if partial_stopword.lower() in paragraph.lower() or paragraph.lower().strip() in exact_stopwords:
    #             valid_paragraph = False
    #             break
    #     if valid_paragraph:
    #         paragraphs.append(paragraph)
    # partial_stopwords = set(open('partial_stopwords.txt', encoding='utf-8').read().split('\n'))
    # exact_stopwords = set(open('exact_stopwords.txt', encoding='utf-8').read().split('\n'))

    # Break paragraphs into sentences
    sentences = []
    for paragraph in paragraphs:
        for sentence in sent_tokenize(paragraph):
            sentences.append(sentence.strip())

    # Include headline in sentences
    sentences.insert(0, title)

    return sentences


def get_article_content(html):
    article = newspaper.Article('')
    article.set_html(html)
    article.parse()

    return article.title, article.text


def get_sentence_offsets(sentences):
    '''
    Get the start and end indicies of
    each sentence within the article
    '''
    offsets = []
    offset = 0
    for sentence in sentences:
        offsets.append((offset, offset + len(sentence) - 1))
        offset += len(sentence)
    return offsets


def get_article_summary(text, n):
    '''
    Get n-sentences that best summarise the article
    and neutralize biased terms within the summary (to-do)
    '''
    parser = PlaintextParser.from_string(text, Tokenizer('english'))
    summarizer = Summarizer(Stemmer('english'))
    summarizer.stop_words = get_stop_words('english')
    return [str(s) for s in summarizer(parser.document, n)]


def get_read_time(word_count):
    '''
    Calculate read time of entire
    article in minutes and seconds
    '''
    minutes = int(word_count / 250)
    seconds = int(((word_count / 250) % 1) * 60)
    return {'minutes': minutes, 'seconds': seconds}


def get_readability_level(sent_count, word_count, char_count):
    '''
    Calculate readibility rating of article
    using the automated readibility index
    '''
    # Calculate ARI score
    ari_score = math.ceil((4.71 * (char_count / word_count)) +
                          (0.5 * (word_count / sent_count)) - 21.43)

    # Map ARI score to readibility category
    if ari_score <= 5:
        return 'Elementary Level'
    elif ari_score <= 8:
        return 'Middle School Level'
    elif ari_score <= 12:
        return 'High School Level'
    elif ari_score <= 13:
        return 'College Level'
    else:
        return 'Professor Level'


def get_sentiment_data(body, sentences, sentence_offsets, default_entity_name):
    # Query Google NLP
    document = {'content': body, 'type': enums.Document.Type.PLAIN_TEXT, 'language': 'en'}
    response = client.analyze_entity_sentiment(document, encoding_type=enums.EncodingType.UTF32)

    # Cluster similar entities together
    # clustered_response = cluster_response_entities(response)

    # List unwanted entities based on category type
    unwanted_entities = get_unwanted_entities(response, body)

    # Classify sentiment of sentences from all perspectives
    perspective_data = get_perspective_data(response, unwanted_entities, default_entity_name, sentences, sentence_offsets)

    # Classify overall sentiment towards entities
    positive_towards, negative_towards = get_overall_perspective_data(response, unwanted_entities)
    
    return perspective_data, positive_towards, negative_towards


def cluster_response_entities(response):
    '''
    Merge similar entities together, as Google NLP often
    lists entities seperately when they refer to the same
    entity (e.g. Jane and Jane Doe)
    '''

    '''
    entity_names = [ent.name.lower() for ent in response.entities]

    cluster_mappings = {}
    for entity_one in entity_names:
        for entity_two in entity_names:
            if entity_two in entity_one and entity_two != entity_one:
                cluster_mappings[entity_two] = entity_one

    return response
    '''
    pass


def get_unwanted_entities(response, body):
    '''
    Get a list of all unwanted entities
    based on desired entity types
    '''
    # Get list of target entities
    target_entity_types = ('PERSON', 'ORGANIZATION')
    target_entities = get_entities(body, target_entity_types)

    # Get list of entities to ignore
    unwanted_entities = set()
    for entity in response.entities:
        remove_entity = True

        # Check whether entity or mention names appear in target list
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

        if sentence_sentiment['compound'] < -0.4:
            perspective_data[default_entity_name].append({
                'sentence_index': sentence_index,
                'sentence_class_string': sentence_attribute_options['classes'][0],
                'sentence_class_title': sentence_attribute_options['titles'][0],
                'sentence_class_value': sentence_attribute_options['values'][0]
            })
        elif sentence_sentiment['compound'] > 0.4:
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

        if entity.sentiment.magnitude > MAGNITUDE_THRESHOLD:
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


GOOGLE_API_KEY = r'C:\Users\Samuel\Desktop\Troogl\Extension\api\google-key.json'
POSITIVE_SENTIMENT_THRESHOLD = 0.15
NEGATIVE_SENTIMENT_THRESHOLD = -0.15
MAGNITUDE_THRESHOLD = 0.4

client = language.LanguageServiceClient.from_service_account_json(GOOGLE_API_KEY)
nlp = spacy.load('en_core_web_sm')
sentiment_analyzer = SentimentIntensityAnalyzer()
