import tokenizer from "sbd"
import extractor from "unfluffjs"
import { injectToast } from "content/components/toast/Toast"
import { ISentence } from "../interfaces/ISentence"
import MetricType from "../vo/MetricType"
import { enableEditing, hasElementWithId, disableEditing } from "./Page"

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

function injectSentenceWrappers(sentences: ISentence[], metricType: string): void {
  enableEditing()

  sentences.map((sentence) => {
    if (window.find(sentence.text)) {
      const range = window.getSelection()?.getRangeAt(0)

      if (range) {
        const id = `troogl-sentence-${sentence.index}`

        const color = metricType == MetricType.Sentiment
          ? sentence.sentiment.color
          : sentence.subjectivity.color
      
        const label = metricType == MetricType.Sentiment
          ? sentence.sentiment.label
          : sentence.subjectivity.label
      
        if (hasElementWithId(id)) {
          updateWrapper(id, color, label)
        } else {
          const wrapper = buildWrapper(id, color, label, range)
          range.insertNode(wrapper)
        }
      }
    }
  })

  disableEditing()
}

function updateWrapper(id: string, color: string, label: string) {
  const element = document.getElementById(id)!
  element.title = label
  element.style.backgroundColor = color
}

function buildWrapper(id: string, color: string, label: string, range: Range): HTMLSpanElement {
  const span = document.createElement("span")

  span.id = id
  span.title = label
  span.style.color = "#333"
  span.style.backgroundColor = color
  span.style.borderRadius = "5px"
  span.style.cursor = "pointer"

  span.appendChild(range.extractContents())
  span.onmouseover = () => { span.style.filter = "brightness(103%)" }
  span.onmouseout = () => { span.style.filter = "brightness(100%)" }
  span.onclick = () => { injectToast("Ability to vote on ratings coming soon :)") }
  
  return span
}

export { parseSentences, injectSentenceWrappers }
