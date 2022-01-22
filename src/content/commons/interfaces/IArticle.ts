import { ISentence } from "./ISentence";

interface IArticle {
  meta: IMeta,
  keywords: string[]
  sentences: ISentence[]
  summarySentences: string[]
  sentimentPieChart: ISentimentPieChart
  subjectivityPieChart: ISubjectivityPieChart
}

interface IMeta {
  readTime: string,
  readComplexity: string,
  charCount: number,
  sentenceCount: number,
}

interface ISentimentPieChart {
  positive: number
  neutral: number
  negative: number
}

interface ISubjectivityPieChart {
  objective: number
  subjective: number
}

export default IArticle

export type { ISentimentPieChart, ISubjectivityPieChart }
