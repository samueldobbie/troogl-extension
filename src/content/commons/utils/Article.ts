import Endpoint from "../configs/Endpoint";
import { ISentence } from "../interfaces/ISentence";
import { parseSentences } from "./Sentence";

async function readArticle(html: string): Promise<ISentence[]> {
  const sentences = parseSentences(html)
  
  return fetch(Endpoint.AnalyzeSentences, {
    method: "POST",
    body: JSON.stringify({"sentences": sentences}),
  })
    .then(response => response.json())
    .then(response => response["data"])
}

export { readArticle }
