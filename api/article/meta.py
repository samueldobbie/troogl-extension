import readtime
import textstat

def get_meta_data(raw_sentences, full_text):
    read_time = get_read_time(full_text)
    read_complexity = get_read_complexity(full_text)
    char_count = len(full_text)
    sentence_count = len(raw_sentences)

    return {
        "readTime": read_time,
        "readComplexity": read_complexity,
        "charCount": char_count,
        "sentenceCount": sentence_count,
    }

def get_read_time(full_text):
    return str(readtime.of_text(full_text))

def get_read_complexity(full_text):
    read_score = textstat.flesch_reading_ease(full_text)

    if read_score <= 29:
        return "Very complex"
    elif read_score <= 49:
        return "Complex"
    elif read_score <= 59:
        return "Fairly complex"
    elif read_score <= 69:
        return "Average"
    elif read_score <= 79:
        return "Fairly simple"
    elif read_score <= 89:
        return "Simple"
    else:
        return "Very simple"
