import { ISentence } from "./ISentence";

interface IArticle {
  summary: string
  keywords: string[]
  sentences: ISentence[]
  sentimentPieChart: ISentimentPieChart
  subjectivityPieChart: ISubjectivityPieChart
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
