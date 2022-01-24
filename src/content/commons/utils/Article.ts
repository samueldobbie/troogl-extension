import IArticle from "../interfaces/IArticle"
import Endpoint from "../vo/Endpoint"
import { parseSentences } from "./Sentence"

async function readArticle(html: string): Promise<IArticle> {
  const sentences = parseSentences(html)
  
  return fetch(Endpoint.AnalyzeArticle, {
    method: "POST",
    body: JSON.stringify({ "sentences": sentences }),
  })
    .then(response => response.json())
    .then(response => response["article"])
}

export { readArticle }
