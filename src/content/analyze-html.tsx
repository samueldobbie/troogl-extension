import { injectLoader, removeLoader } from "./components/loader"
import { enableEditing, disableEditing } from "./utils/page"
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
  // Inject visual elements and bind events
  // addPartialDashboard(article['sentence_sentiment_classes']);
  // addCompleteDashboard(article);
  // addSentencePopup();
  // bindDashboardEvents();

  // // Populate graphs
  // updateGraphs();
}

export { analyzeHtml }
