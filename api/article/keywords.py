def get_keywords(raw_sentences):
    from rake_nltk import Rake

    rake = Rake()
    rake.extract_keywords_from_sentences(raw_sentences)
    keywords = [kw for kw in rake.get_ranked_phrases() if len(kw.split()) <= 2]

    return keywords[:20]
