import { getSentences, injectSentenceWrappers } from "./commons/utils/Sentence"
import { injectDashboard } from "./components/dashboard/Dashboard"
import { injectLoader, removeLoader } from "./components/loader/Loader"

declare global {
  interface Window {
    find: (text: string) => boolean
  }
}

function handleMessage(request: any): void {
  if (hasBeenAnalyzed()) return

  const html = document.documentElement.innerHTML

  if (request.topic === "TabUpdated") {
    analyzeHtml(html)
  } else if (request.topic === "AnalyzeButtonClicked") {
    analyzeHtml(html)
  }
}

function hasBeenAnalyzed(): boolean {
  return document.getElementById("troogl-extension") !== null
}

function analyzeHtml(html: string): void {
  injectLoader()

  const sentences = getSentences(html)
  injectSentenceWrappers(sentences)
  injectDashboard(sentences)

  removeLoader()
}

chrome.runtime.onMessage.addListener(handleMessage)
