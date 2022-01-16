import Sentiment from "sentiment"

export interface ISentimentData {
  label: string
  score: number
  color: string
}

const sentiment = new Sentiment()

function getSentimentData(sentence: string): ISentimentData {
  const score = sentiment.analyze(sentence).score

  if (score > 4) {
    return {
      label: "positive",
      score: 1,
      color: "rgb(182, 255, 200)",
    }
  } else if (score >= -4 && score <= 4) {
    return {
      label: "neutral",
      score: 0,
      color: "rgb(243, 243, 243)",
    }
  } else {
    return {
      label: "negative",
      score: -1,
      color: "rgb(255, 196, 196)",
    }
  }
}

export { getSentimentData }
