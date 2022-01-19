import { IMetric } from "./IMetric"

interface ISentence {
  index: number
  text: string
  sentiment: IMetric
  subjectivity: IMetric
}

export type { ISentence }
