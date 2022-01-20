from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

def get_summary(full_text):
    LANGUAGE = "english"
    SENTENCES_COUNT = 3

    parser = PlaintextParser.from_string(full_text, Tokenizer(LANGUAGE))
    stemmer = Stemmer(LANGUAGE)
    summarizer = Summarizer(stemmer)
    summarizer.stop_words = get_stop_words(LANGUAGE)
    
    summary_sentences = []

    for sentence in summarizer(parser.document, SENTENCES_COUNT):
        summary_sentences.append(str(sentence))

    return ". ".join(summary_sentences)
