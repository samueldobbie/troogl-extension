from summa import keywords

def get_keywords(full_text):
    return keywords.keywords(full_text, split=True)[:15]
