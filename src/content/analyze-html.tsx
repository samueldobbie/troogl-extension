import React from "react"
import Dashboard from "./components/dashboard"
import { injectLoader, removeLoader } from "./components/loader"
import { enableEditing, disableEditing, replaceContainerWithComponent } from "./utils/page"
import { getSentences, buildSentenceWrapper } from "./utils/sentence"
import { getSentimentData, ISentimentData } from "./utils/sentiment"

declare global {
  interface Window {
      find: (text: string) => boolean
  }
}

export interface ISentenceData {
  index: number
  sentence: string
  sentimentData: ISentimentData
}

function analyzeHtml(html: string): void {
  injectLoader()

  const sentenceData = getSentenceData(html)
  injectSentenceSentiments(sentenceData)
  injectDashboard(sentenceData)

  removeLoader()
}

function getSentenceData(html: string): ISentenceData[] {
  const sentences = getSentences(html)

  return sentences.map((sentence, index) => {
    const sentimentData = getSentimentData(sentence)

    return {
      index,
      sentence,
      sentimentData,
    }
  })
}

function injectSentenceSentiments(sentenceData: ISentenceData[]): void {
  enableEditing()

  // TODO subjectivity
  sentenceData.map((item) => {
    if (window.find(item.sentence)) {
      const range = window.getSelection()?.getRangeAt(0)
      
      if (range) {
        const wrapper = buildSentenceWrapper(item, range)
        range.insertNode(wrapper)
      }
    }
  })
  
  disableEditing()
}

function injectDashboard(sentenceData: ISentenceData[]) {
  addPartialDashboard(sentenceData)

  // addCompleteDashboard(article)
  // addSentencePopup()
  // bindDashboardEvents()

  // // Populate graphs
  // updateGraphs()
}

function appendJsxToBody(component: JSX.Element): void {
  const container = document.createElement("div")
  document.body.appendChild(container)
  replaceContainerWithComponent(container, component)
}

function addPartialDashboard(sentenceData: ISentenceData[]): void {
  appendJsxToBody(<Dashboard sentenceData={sentenceData} />)

  // const dashboard = getPartialDashboard()
  // document.body.append(dashboard)

  // $('body').append([
  //     getExpandButton(),
  //     getPartialDashboard(sentenceClasses)
  // ])

  // // Enable dragging of dashboard
  // $('#troogl-partial-dashboard-bar').draggable({
  //     handle: '#troogl-draggable-button',
  //     containment: 'window',
  //     cursor: 'grabbing',
  //     axis: 'y',
  //     scroll: false
  // })
}

export { analyzeHtml }
