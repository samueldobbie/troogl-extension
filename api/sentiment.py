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

import json
import math
import newspaper
import requests
import spacy

class SentimentAnalyzer:
    def __init__(self, body, sentences):
        self.body = body
        self.sentences = sentences
        self.extract_sentiment()

    # def analyse_content1(body, sentences, sentence_offsets)
    def extract_sentiment(self):
        self.analyse_sentiment()
        self.extract_entities()

        # # Classify sentiment of sentences from all perspectives
        # self.get_perspective_data(response, unwanted_entities, default_entity_name, sentences, sentence_offsets)

        # # Classify overall sentiment towards entities
        # self.get_overall_perspective_data(response, unwanted_entities)

    def analyse_sentiment(self):
        document = {
            'content': self.body,
            'type': enums.Document.Type.PLAIN_TEXT,
            'language': 'en',
        }

        self.response = client.analyze_entity_sentiment(document, enums.EncodingType.UTF32)

    def extract_entities(self):
        self.get_target_entities()
        self.get_unwanted_entities()


    def get_target_entities(body, target_entity_types):
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

    def get_unwanted_entities(self, response, body):
        '''
        Get a list of all unwanted entities
        based on desired entity types
        '''
        # Get list of target entities
        target_entity_types = 
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

        self.unwanted_entities = unwanted_entities

    # def get_perspective_data(response, unwanted_entities, default_entity_name, sentences, sentence_offsets):
    #     '''
    #     Classify sentiment of article sentences
    #     from all perspectives (default + entity)
    #     '''
    #     # Define attributes used for adjusting display of sentence within article
    #     sentence_attribute_options = {
    #         'classes': ['troogl-negative', 'troogl-positive'],
    #         'titles': ['Negative', 'Positive'],
    #         'values': [-1, 1]
    #     }

    #     # Classify default and entity sentiments
    #     default_perspective_data = classify_default_perspective(default_entity_name, sentences, sentence_attribute_options)
    #     entity_perspective_data = classify_entity_perspectives(response, unwanted_entities, sentence_offsets, sentence_attribute_options)

    #     # Combine default and entity perspectives
    #     perspective_data = default_perspective_data.copy()
    #     perspective_data.update(entity_perspective_data)

    #     self.perspective_data = perspective_data

    # def classify_default_perspective(default_entity_name, sentences, sentence_attribute_options):
    #     '''
    #     Classify sentiment of article sentences
    #     from default perspective (user's perspective)
    #     '''
    #     default_entity_name = 'Everyday News Reader'

    #     perspective_data = {default_entity_name: []}
    #     for sentence_index in range(len(sentences)):
    #         sentence_sentiment = sentiment_analyzer.polarity_scores(sentences[sentence_index])

    #         if sentence_sentiment['compound'] < -0.4:
    #             perspective_data[default_entity_name].append({
    #                 'sentence_index': sentence_index,
    #                 'sentence_class_string': sentence_attribute_options['classes'][0],
    #                 'sentence_class_title': sentence_attribute_options['titles'][0],
    #                 'sentence_class_value': sentence_attribute_options['values'][0]
    #             })
    #         elif sentence_sentiment['compound'] > 0.4:
    #             perspective_data[default_entity_name].append({
    #                 'sentence_index': sentence_index,
    #                 'sentence_class_string': sentence_attribute_options['classes'][1],
    #                 'sentence_class_title': sentence_attribute_options['titles'][1],
    #                 'sentence_class_value': sentence_attribute_options['values'][1]
    #             })

    #     return perspective_data

    # def classify_entity_perspectives(response, unwanted_entities, sentence_offsets, sentence_attribute_options):
    #     '''
    #     Classify the sentiment for the article sentences from
    #     the perspective of mentioned people and organizations
    #     '''
    #     perspective_data = {}
    #     for entity in response.entities:
    #         entity_name = entity.name.strip().title()

    #         if entity_name.lower() in unwanted_entities:
    #             continue

    #         if entity_name not in perspective_data:
    #             perspective_data[entity_name] = []

    #         for mention in entity.mentions:
    #             # Select attributes for the sentence that mentions the entity
    #             sentence_class, sentence_title, sentence_value = get_sentence_attributes(mention, sentence_attribute_options)

    #             # Get the index of the sentence where the entity was mentioned
    #             sentence_index = get_mention_sentence_index(mention, sentence_offsets)

    #             if sentence_class != '' and sentence_index != -1:
    #                 perspective_data[entity_name].append({
    #                     'sentence_index': sentence_index,
    #                     'sentence_class_string': sentence_class,
    #                     'sentence_class_title': sentence_title,
    #                     'sentence_class_value': sentence_value,
    #                 })

    #     # Ignore perspectives that don't include at least one non-neutral sentence
    #     updated_perspective_data = {}
    #     for key, value in perspective_data.items():
    #         if len(value) > 0:
    #             updated_perspective_data[key] = value

    #     # Sort perspectives by count of non-neutral sentences
    #     sorted(updated_perspective_data, key=lambda k: len(updated_perspective_data[k]), reverse=True)

    #     return updated_perspective_data

    # def get_sentence_attributes(mention, options):
    #     '''
    #     Select the attributes for the sentence that
    #     mentions the entity based on the sentiment
    #     '''
    #     if mention.sentiment.score < NEGATIVE_SENTIMENT_THRESHOLD and mention.sentiment.magnitude > MAGNITUDE_THRESHOLD:
    #         return options['classes'][0], options['titles'][0], options['values'][0]
    #     elif mention.sentiment.score > POSITIVE_SENTIMENT_THRESHOLD and mention.sentiment.magnitude > MAGNITUDE_THRESHOLD:
    #         return options['classes'][1], options['titles'][1], options['values'][1]
    #     else:
    #         return '', '', ''

    # def get_mention_sentence_index(mention, sentence_offsets):
    #     '''
    #     Get the index of the sentence
    #     where the entity was mentioned
    #     '''
    #     for i in range(len(sentence_offsets)):
    #         if mention.text.begin_offset >= sentence_offsets[i][0] and mention.text.begin_offset <= sentence_offsets[i][1]:
    #             return i
    #     return -1

    # def get_overall_perspective_data(response, unwanted_entities):
    #     '''
    #     Determine which entities are mentioned
    #     positively or negatively overall
    #     '''
    #     negative_towards = {}
    #     positive_towards = {}
    #     for entity in response.entities:
    #         entity_name = entity.name.strip().title()
    #         entity_type = enums.Entity.Type(entity.type).name

    #         if entity_name.lower() in unwanted_entities:
    #             continue

    #         if entity.sentiment.magnitude > MAGNITUDE_THRESHOLD:
    #             if entity.sentiment.score < NEGATIVE_SENTIMENT_THRESHOLD:
    #                 negative_towards[entity_name] = {
    #                     'type': entity_type
    #                 }
    #             elif entity.sentiment.score > POSITIVE_SENTIMENT_THRESHOLD:
    #                 positive_towards[entity_name] = {
    #                     'type': entity_type
    #                 }

    #     self.positive_towards, self.negative_towards = positive_towards, negative_towards

    # def get_subjectivity_class(body):
    #     subjectivity = TextBlob(body).sentiment.subjectivity
    #     if subjectivity < 0.25:
    #         return 'Mostly objective'
    #     elif subjectivity < 0.50:
    #         return 'Fairly objective'
    #     elif subjectivity < 0.75:
    #         return 'Fairly opinionated'
    #     else:
    #         return 'Mostly opinionated'

# /home/samuel/Desktop/projects/troogl/troogl-extension/api/
GOOGLE_API_KEY = 'google-api-key.json'
# POSITIVE_SENTIMENT_THRESHOLD = 0.15
# NEGATIVE_SENTIMENT_THRESHOLD = -0.15
# MAGNITUDE_THRESHOLD = 0.4

client = language.LanguageServiceClient.from_service_account_json(GOOGLE_API_KEY)
# nlp = spacy.load('en_core_web_sm')
# sentiment_analyzer = SentimentIntensityAnalyzer()
# stopwords = set(open('stopwords.txt', encoding='utf-8').read().lower().split('\n'))
