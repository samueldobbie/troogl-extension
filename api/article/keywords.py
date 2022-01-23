def get_keywords(full_text):
    from rake_nltk import Rake

    rake = Rake()
    rake.extract_keywords_from_text(full_text)

    return list(set(rake.get_ranked_phrases()))[:15]
