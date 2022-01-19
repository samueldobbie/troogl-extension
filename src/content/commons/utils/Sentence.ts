import extractor from "unfluffjs"
import tokenizer from "sbd"
import { ISentence } from "../interfaces/ISentence"
import { enableEditing, disableEditing } from "./Page"

function parseSentences(html: string): string[] {
  const data = extractor(html)
  const sentences = []
  const cleanedTitle = data.softTitle.trim()

  if (cleanedTitle) {
    sentences.push(cleanedTitle)
  }

  tokenizer
    .sentences(data.text)
    .forEach(section => {
      section
        .split("\n")
        .forEach(sentence => {
          const cleanSentence = sentence.trim()

          if (cleanSentence) {
            sentences.push(cleanSentence)
          }
      })
    })

  return sentences
}

function injectSentenceWrappers(sentences: ISentence[]): void {
  enableEditing()

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

export { parseSentences, injectSentenceWrappers, buildSentenceWrapper }
