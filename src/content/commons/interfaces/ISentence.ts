import { ISentiment } from "./ISentiment";

interface ISentence {
  index: number
  text: string
  sentiment: ISentiment
}

export type { ISentence }
