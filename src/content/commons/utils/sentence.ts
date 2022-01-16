import extractor from "unfluffjs"
import tokenizer from "sbd"
import { ISentence } from "../interfaces/sentence"

function getSentences(html: string): string[] {  
  const data = extractor(html)
  const sentences = [data.softTitle]

  tokenizer
    .sentences(data.text)
    .forEach(sentence => {
      const subSentences = sentence.split("\n")

      subSentences.forEach(subSentece => {
        if (subSentece !== "") {
          sentences.push(subSentece)
        }
      })
    })

  return sentences
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0)
}

function buildSentenceWrapper(sentence: ISentence, range: Range): HTMLSpanElement {
  const span = document.createElement("span")
  span.id = `troogl-sentence-${sentence.index}`

  span.appendChild(range.extractContents())
  span.style.backgroundColor = sentence.sentiment.color
  span.style.borderRadius = "5px"
  span.style.cursor = "pointer"

  span.addEventListener("mouseover", () => {
    span.style.filter = "brightness(95%)"
  })

  span.addEventListener("mouseout", () => {
    span.style.filter = "brightness(100%)"
  })

  return span
}

export { getSentences, buildSentenceWrapper }
