import math
import newspaper

from nltk.tokenize import sent_tokenize
from num2words import num2words

class Article:
    def __init__(self, url):
        self.url = url

    def extract_content(self):
        content = self.parse_content()

        self.headline = content.title
        self.body = content.text
        self.summary = content.summary
        self.sentences = self.parse_sentences_from_body()

    def parse_content(self):
        content = newspaper.Article(self.url)
        content.download()
        content.parse()
        content.nlp()
        return content

    def parse_sentences_from_body(self):
        sentences = []
        for paragraph in self.body.split('\n'):
            for sentence in sent_tokenize(paragraph):
                if sentence.strip() == '':
                    continue
                sentences.append(sentence.strip())
        return sentences

    def analyse_content(self):
        self.extract_metrics()
        self.extract_sentiment()

    def extract_metrics(self):
        self.character_count = len(self.body)
        self.word_count = len(self.body.split(' '))
        self.sentence_count = len(self.sentences)
        self.read_time_minutes = self.get_read_time_minutes()

    def get_read_time_minutes(self):
        return int(self.word_count / 250)

    def categorise_readability(self):
        automated_readability_index = math.ceil(
            (4.71 * (self.character_count / self.word_count)) +
            (0.5 * (self.word_count / self.sentence_count)) - 21.43)
        return self.get_index_category(index=automated_readability_index)

    def get_index_category(self, index):
        if index == 1:
            return 'Kindergarten'
        elif index < 14:
            return num2words(index, to='ordinal') + ' grade'
        elif index == 14:
            return 'College grade'
        return 'Professor'

    def extract_sentiment(self):
        pass
