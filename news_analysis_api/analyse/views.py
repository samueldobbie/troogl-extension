from django.http import HttpResponse

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
import json
import newspaper
import spacy

def analyse_article(request):
    '''
    Analyse specified article and return data
    to be displayed by the troogl extension
    '''

    url = request.GET['url']

    # Extract core article data from specified url
    article_data = extract_article_data_from_url(url)

    # Return empty response if article parsing was unsuccessful
    if article_data is None:
        return HttpResponse(None)

    # Define default entity name
    article_data['default_entity_name'] = 'Everyday News Reader'

    # Get sentence sentiments for all entity perspectives
    sentence_sentiment_classes, positive_towards, negative_towards = extract_sentiment_data(
        article_data['body'],
        article_data['sentences'],
        article_data['sentence_offsets'],
        article_data['default_entity_name']
    )

    article_data['sentence_sentiment_classes'] = sentence_sentiment_classes
    article_data['positive_towards'] = positive_towards
    article_data['negative_towards'] = negative_towards

    # Get subjectivity for overall article
    article_data['subjectivity'] = get_subjectivity_class(article_data['body'])

    return HttpResponse(json.dumps(article_data))


def extract_article_data_from_url(url):
    '''
    Extact core data from specified article URL
    '''

    try:
        article = newspaper.Article(url=url, config=get_newspaper_configuration())
        article.download()
        article.parse()
    except:
        return None

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
    # Strip out paragraphs that include defined stopwords
    paragraphs = []
    for paragraph in text.split('\n'):
        valid_paragraph = True
        for stopword in stopwords:
            if stopword.lower() in paragraph.lower():
                valid_paragraph = False
                break
        if valid_paragraph:
            paragraphs.append(paragraph)

    # Tokenize remaining paragraphs into sentences
    sentences = []
    for paragraph in paragraphs:
        for sentence in sent_tokenize(paragraph):
            sentences.append(sentence.strip())

    return sentences


def get_article_summary(text, LANGUAGE, MAX_SUMMARY_SENTENCE_COUNT):
    '''
    Get summary of article and neutralize the biased terms (to-do)
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


def extract_sentiment_data(body, sentences, sentence_offsets, default_entity_name):
    # Query Google NLP
    document = {'content': body, 'type': enums.Document.Type.PLAIN_TEXT, 'language': 'en'}
    response = client.analyze_entity_sentiment(document, encoding_type=enums.EncodingType.UTF8)

    # Cluster similar entities together
    clustered_response = cluster_response_entities(response)

    # Strip unwanted entities based on category type
    clean_response = strip_response_categories(clustered_response, body)

    # Classify sentiment of sentences from all perspectives
    perspective_data = get_perspective_data(clean_response, default_entity_name, sentences, sentence_offsets)

    # Classify overall sentiment towards entities
    positive_towards, negative_towards = get_overall_perspective_data(clean_response)
    
    return perspective_data, positive_towards, negative_towards


def cluster_response_entities(reponse):
    '''
    Merge similar entities together, as Google NLP will
    often list two entities seperately even though they
    typically refer to the same entity
    '''

    return reponse


def strip_response_categories(response, body):
    '''
    Strip unwanted entity categories from response
    '''

    # Get list of target entities
    target_entity_types = ('PERSON', 'ORGANIZATION')
    target_entities = get_entities(body, target_entity_types)

    print(target_entities)

    # Remove 

    return response


def get_perspective_data(response, default_entity_name, sentences, sentence_offsets):
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
    entity_perspective_data = classify_entity_perspectives(response, sentence_offsets, sentence_attribute_options)
    
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


def classify_entity_perspectives(response, sentence_offsets, sentence_attribute_options):
    '''
    Classify the sentiment for the article sentences from
    the perspective of mentioned people and organizations 
    '''

    perspective_data = {}
    for entity in response.entities:
        entity_name = entity.name.strip().title()

        if entity_name not in perspective_data:
            perspective_data[entity_name] = []

        for mention in entity.mentions:
            sentence_class = ''
            sentence_title = ''
            sentence_value = ''
            if mention.sentiment.score < NEGATIVE_SENTIMENT_THRESHOLD and mention.sentiment.magnitude > MAGNITUDE_THRESHOLD:
                sentence_class = sentence_attribute_options['classes'][0]
                sentence_title = sentence_attribute_options['titles'][0]
                sentence_value = sentence_attribute_options['values'][0]
            elif mention.sentiment.score > POSITIVE_SENTIMENT_THRESHOLD and mention.sentiment.magnitude > MAGNITUDE_THRESHOLD:
                sentence_class = sentence_attribute_options['classes'][1]
                sentence_title = sentence_attribute_options['titles'][1]
                sentence_value = sentence_attribute_options['values'][1]

            if sentence_class != '':
                # Get the index of the sentence that the entity was mentioned within
                sentence_index = 0
                for offset_index in range(len(sentence_offsets)):
                    if mention.text.begin_offset >= sentence_offsets[offset_index][0] and mention.text.begin_offset <= sentence_offsets[offset_index][1]:
                        sentence_index = offset_index
                        break

                perspective_data[entity_name].append({
                    'sentence_index': sentence_index,
                    'sentence_class_string': sentence_class,
                    'sentence_class_title': sentence_title,
                    'sentence_class_value': sentence_value,
                })

    # Ignore perspectives that don't include at least one non-neutral sentence
    updated_perspective_data = {}
    for key, value in updated_perspective_data.items():
        if len(value) > 0:
            updated_perspective_data[key] = value

    # Sort perspectives by count of non-neutral sentences
    sorted(updated_perspective_data, key=lambda k: len(updated_perspective_data[k]), reverse=True)

    return updated_perspective_data


def get_entities(body, target_entity_types):
    '''
    Get list of people and organizations mentioned
    within the article (more accurate than GNLP)
    '''
    document = nlp(body)
    entities = set()
    for entity in document.ents:
        if entity.label_ in target_entity_types:
            entities.add(str(entity).strip().title())
    return entities


def get_overall_perspective_data(response):
    '''
    Determine which entities are mentioned
    positively or negatively overall
    '''
    positive_towards = {}
    negative_towards = {}
    for entity in response.entities:
        entity_name = entity.name.strip().title()
        entity_type = enums.Entity.Type(entity.type).name

        if entity.sentiment.score < NEGATIVE_SENTIMENT_THRESHOLD and entity.sentiment.magnitude > MAGNITUDE_THRESHOLD and entity.salience > SALIENCE_THRESHOLD:
            positive_towards[entity_name] = {
                'type': entity_type
            }
        elif entity.sentiment.score > POSITIVE_SENTIMENT_THRESHOLD and entity.sentiment.magnitude > MAGNITUDE_THRESHOLD and entity.salience > SALIENCE_THRESHOLD:
            negative_towards[entity_name] = {
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


newspaper_configuration = newspaper.Config()
user_agent_generator = fake_useragent.UserAgent()
client = language_v1.LanguageServiceClient.from_service_account_json(r'C:\Users\Samuel\Desktop\Troogl Browser Extension\troogl_extension_env\Troogl Browser Extension\news_analysis_api\ce-v1-f594c3be6fc9.json')
stopwords = set(open('stopwords.txt', encoding='utf-8').read().split('\n'))
nlp = spacy.load('en_core_web_md')
sentiment_analyzer = SentimentIntensityAnalyzer()

POSITIVE_SENTIMENT_THRESHOLD = 0.15
NEGATIVE_SENTIMENT_THRESHOLD = -0.15
MAGNITUDE_THRESHOLD = 0.2
SALIENCE_THRESHOLD = 0
