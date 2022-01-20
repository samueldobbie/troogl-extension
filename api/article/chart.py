from article.metric import MetricType, SentimentLabel, SubjectivityLabel

def get_pie_chart(analyzed_sentences):
    sentiment_labels = get_label_counts(
        analyzed_sentences=analyzed_sentences,
        label_counts=sentiment_label_counts,
        metric_type=MetricType.Sentiment,
    )

    subjectivity_labels = get_label_counts(
        analyzed_sentences=analyzed_sentences,
        label_counts=subjectivity_label_counts,
        metric_type=MetricType.Subjectivity,
    )

    return {
        MetricType.Sentiment: sentiment_labels,
        MetricType.Subjectivity: subjectivity_labels,
    }

def get_label_counts(analyzed_sentences, label_counts, metric_type):
    for sentence in analyzed_sentences:
        label = sentence[metric_type]["label"]
        label_counts[label] += 1

    return label_counts

sentiment_label_counts = {
    SentimentLabel.Positive: 0,
    SentimentLabel.Neutral: 0,
    SentimentLabel.Negative: 0,
}

subjectivity_label_counts = {
    SubjectivityLabel.Objective: 0,
    SubjectivityLabel.Subjective: 0,
}
