import { ISentiment } from "./sentiment";

interface ISentence {
  index: number
  text: string
  sentiment: ISentiment
}

export type { ISentence }
