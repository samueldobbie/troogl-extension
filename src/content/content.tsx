import { analyzeHtml } from "./analyze-html"

function handleMessage(request: any) {
  if (hasBeenAnalyzed()) return

  const html = document.documentElement.innerHTML

  if (request.topic === "TabUpdated") {
    analyzeHtml(html)
  } else if (request.topic === "AnalyzeButtonClicked") {
    analyzeHtml(html)
  }
}

function hasBeenAnalyzed() {
  return document.getElementById("troogl-extension") !== null
}

chrome.runtime.onMessage.addListener(handleMessage)
