import React from "react"
import Dashboard from "./components/dashboard"
import { injectLoader, removeLoader } from "./components/loader"
import { enableEditing, disableEditing, replaceContainerWithComponent } from "./utils/page"
import { getSentences, buildSentenceWrapper } from "./utils/sentence"

declare global {
  interface Window {
      find: (text: string) => boolean
  }
}

function analyzeHtml(html: string): void {
  injectLoader()
  injectSentenceSentiments(html)
  injectDashboard()
  removeLoader()
}

function injectSentenceSentiments(html: string): void {
  enableEditing()

  // TODO subjectivity
  getSentences(html).map((sentence) => {
    if (window.find(sentence)) {
      const range = window.getSelection()?.getRangeAt(0)
      
      if (range) {
        const wrapper = buildSentenceWrapper(sentence, range)
        range.insertNode(wrapper)
      }
    }
  })
  
  disableEditing()
}

function injectDashboard() {
  addPartialDashboard()

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

function addPartialDashboard(): void {
  appendJsxToBody(<Dashboard />)

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
