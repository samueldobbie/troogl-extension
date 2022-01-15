import Sentiment from "sentiment"

const sentiment = new Sentiment()

function getSentimentLabelColor(label: string): string {
  if (label === "positive") {
    return "rgb(182, 255, 200)"
  } else if (label === "neutral") {
    return "rgb(243, 243, 243)"
  } else {
    return "rgb(255, 196, 196)"
  } 
}

function getSentimentLabel(sentence: string): string {
  const score = sentiment.analyze(sentence).score

  if (score > 4) {
    return "positive"
  } else if (score >= -4 && score <= 4) {
    return "neutral"
  } else {
    return "negative"
  }
}

export { getSentimentLabel, getSentimentLabelColor }
