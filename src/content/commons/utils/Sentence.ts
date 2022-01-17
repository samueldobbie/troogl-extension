import extractor from "unfluffjs"
import tokenizer from "sbd"
import { ISentence } from "../interfaces/ISentence"
import { enableEditing, disableEditing } from "./Page"
import { getSentiment } from "./Sentiment"

function getSentences(html: string): ISentence[] {
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
    .map((text, index) => {
      const sentiment = getSentiment(text)

      return {
        index,
        text,
        sentiment,
      }
    })
}

function injectSentenceWrappers(sentences: ISentence[]): void {
  enableEditing()

  // TODO subjectivity
  sentences.map((sentence) => {
    if (window.find(sentence.text)) {
      const range = window.getSelection()?.getRangeAt(0)
      
      if (range) {
        const wrapper = buildSentenceWrapper(sentence, range)
        range.insertNode(wrapper)
      }
    }
  })
  
  disableEditing()
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

export { getSentences, injectSentenceWrappers, buildSentenceWrapper }
