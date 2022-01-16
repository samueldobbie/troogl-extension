import React from "react"
import Dashboard from "./components/dashboard"
import { injectLoader, removeLoader } from "./components/loader"
import { ISentence } from "./commons/interfaces/sentence"
import { enableEditing, disableEditing, replaceContainerWithComponent } from "./commons/utils/page"
import { getSentences, buildSentenceWrapper } from "./commons/utils/sentence"
import { getSentiment } from "./commons/utils/sentiment"

declare global {
  interface Window {
    find: (text: string) => boolean
  }
}

function analyzeHtml(html: string): void {
  injectLoader()

  const sentence = getSentence(html)
  injectSentenceSentiments(sentence)
  injectDashboard(sentence)

  removeLoader()
}

function getSentence(html: string): ISentence[] {
  const sentences = getSentences(html)

  return sentences.map((text, index) => {
    const sentiment = getSentiment(text)

    return {
      index,
      text,
      sentiment,
    }
  })
}

function injectSentenceSentiments(sentences: ISentence[]): void {
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

function injectDashboard(sentences: ISentence[]): void {
  appendJsxToBody(<Dashboard sentences={sentences} />)
}

function appendJsxToBody(component: JSX.Element): void {
  const container = document.createElement("div")
  document.body.appendChild(container)
  replaceContainerWithComponent(container, component)
}

export { analyzeHtml }
