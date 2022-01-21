from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

def get_summary(raw_sentences):
    full_text = " ".join(raw_sentences)
    parser = PlaintextParser.from_string(full_text, Tokenizer(LANGUAGE))
    summarizer.stop_words = get_stop_words(LANGUAGE)
    sentences = [str(s) for s in summarizer(parser.document, SENTENCES_COUNT)]
    return " ".join(sentences)

LANGUAGE = "english"
SENTENCES_COUNT = 3
stemmer = Stemmer(LANGUAGE)
summarizer = Summarizer(stemmer)
