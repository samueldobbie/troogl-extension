from textblob import TextBlob

from article.metric import MetricType, SentimentLabel, SubjectivityLabel

def analyze_sentences(raw_sentences):
    sentences = []

    for i, raw_sentence in enumerate(raw_sentences):
        blob = TextBlob(raw_sentence)
        sentiment = get_sentiment_label(blob.sentiment.polarity)
        subjectivity = get_subjectivity_label(blob.sentiment.subjectivity)

        sentences.append({
            "index": i,
            "text": raw_sentence,
            MetricType.Sentiment: sentiment,
            MetricType.Subjectivity: subjectivity
        })

    return sentences

def get_sentiment_label(score):
    # TODO RGB scale based on score

    if score <= -0.5:
        label = SentimentLabel.Negative
        color = "rgb(255, 193, 193)"
    elif score < 0.5:
        label = SentimentLabel.Neutral
        color = "rgb(227, 227, 227)"
    else:
        label = SentimentLabel.Positive
        color = "rgb(183, 255, 197)"

    return {
        "score": score,
        "label": label,
        "color": color,
    }

def get_subjectivity_label(score):
    # TODO RGB scale based on score

    if score <= 0.66:
        label = SubjectivityLabel.Objective
        color = "rgb(227, 227, 227)"
    else:
        label = SubjectivityLabel.Subjective
        color = "rgb(255, 200, 133)"

    return {
        "score": score,
        "label": label,
        "color": color,
    }
