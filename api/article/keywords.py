def get_keywords(raw_sentences):
    from rake_nltk import Rake
    rake = Rake()
    rake.extract_keywords_from_sentences(raw_sentences)
    return rake.get_ranked_phrases()
