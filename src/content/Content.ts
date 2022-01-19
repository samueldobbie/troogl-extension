import MetricType from "./commons/configs/MetricType"
import { readArticle } from "./commons/utils/Article"
import { hasElementWithId } from "./commons/utils/Page"
import { injectSentenceWrappers } from "./commons/utils/Sentence"
import { injectToast } from "./commons/utils/Toast"
import { injectDashboard } from "./components/dashboard/Dashboard"
import { injectLoader, removeLoader } from "./components/loader/Loader"

declare global {
  interface Window {
    find: (text: string) => boolean
  }
}

function handleMessage(request: any): void {
  if (hasElementWithId("troogl-extension")) return

  const html = document.documentElement.innerHTML

  if (request.topic === "TabUpdated") {
    analyzeHtml(html)
  } else if (request.topic === "AnalyzeButtonClicked") {
    analyzeHtml(html)
  }
}

function analyzeHtml(html: string): void {
  injectLoader()

  readArticle(html)
    .then(sentences => {
      console.log(sentences)

      injectSentenceWrappers(sentences, MetricType.Sentiment)
      injectDashboard(sentences)
    })
    .catch(() => injectToast("Failed to analyze article"))
    .finally(() => removeLoader())
}

chrome.runtime.onMessage.addListener(handleMessage)
