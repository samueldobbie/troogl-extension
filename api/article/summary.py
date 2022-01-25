from summa import summarizer

def get_summary(full_text):
    return summarizer.summarize(full_text, split=True)[:3]
