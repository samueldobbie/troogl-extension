import { parse } from "node-html-parser"
import { readArticle } from "./commons/utils/Article"
import { hasElementWithId } from "./commons/utils/Page"
import { injectSentenceWrappers } from "./commons/utils/Sentence"
import MetricType from "./commons/vo/MetricType"
import { injectDashboard } from "./components/dashboard/Dashboard"
import { injectLoader, removeLoader } from "./components/loader/Loader"
import { injectToast } from "./components/toast/Toast"

declare global {
  interface Window {
    find: (text: string) => boolean
  }
}

function handleMessage(request: any): void {
  if (hasElementWithId("troogl-extension")) return

  const html = document.documentElement.innerHTML

  if (request.topic === "AnalyzeButtonClicked") {
    handleAnalyzeButtonClick(html)
  } else if (request.topic === "TabUpdated") {
    handleTabUpdate(html)
  }
}

function handleAnalyzeButtonClick(html: string): void {
  analyzeHtml(html)
}

function handleTabUpdate(html: string): void {
  const root = parse(html)
  const metaTags = root.querySelectorAll("meta")

  metaTags.forEach((metaTag) => {
    const property = metaTag.getAttribute("property")
    const content = metaTag.getAttribute("content")

    if (property == "og:type" && content == "article") {
      analyzeHtml(html)
    }
  })
}

function analyzeHtml(html: string): void {
  injectLoader()

  readArticle(html)
    .then(article => {
      injectSentenceWrappers(article.sentences, MetricType.Sentiment)
      injectDashboard(article)
    })
    .catch(() => injectToast("Failed to analyze article"))
    .finally(() => removeLoader())
}

chrome.runtime.onMessage.addListener(handleMessage)
