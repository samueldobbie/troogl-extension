import extractor from "unfluffjs"
import tokenizer from "sbd"

declare global {
  interface Window {
      find: (text: string) => boolean
  }
}

const analyzeArticle = (url: string) => {
  if (hasBeenAnalyzed()) return

  const sentences = getSentences(url)

  console.log(sentences)

  enablePageEditing()
  window.getSelection()?.collapse(document.body, 0)

  for (let i = 0; i < sentences.length; i++) {
    if (window.find(sentences[i])) {
      const range = window.getSelection()?.getRangeAt(0)
  
      if (range) {
        const anchorTag = document.createElement("a")
        anchorTag.id = `troogl-sentence-${i}`
    
        const sentenceContainer = document.createElement("span")
        sentenceContainer.appendChild(anchorTag)
        sentenceContainer.setAttribute("troogl-sentence-index", i.toString())
        sentenceContainer.classList.add("troogl-sentence")
        sentenceContainer.appendChild(range.extractContents())
        sentenceContainer.style.backgroundColor = "red"
    
        range.insertNode(sentenceContainer)
      }
    }
  }

  disablePageEditing()
  window.scrollTo(0, 0)
  window.getSelection()?.collapse(document.body, 0)
}

const hasBeenAnalyzed = () => {
  return document.getElementById("troogl-extension") !== null
}

const getSentences = (url: string) => {
  const html = document.documentElement.innerHTML
  const data = extractor(html)
  const title = data.softTitle
  const text = data.text

  const sentences = [title]

  tokenizer.sentences(text).forEach(sentence => {
    const s = sentence.split("\n")
    s.forEach(x => {
      if (x !== "") {
        sentences.push(x)
      }
    })
  })

  // const sentences = tokenizer.sentences(text)
  // sentences.unshift(title)
  
  const cleanedSentences = sentences
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0)

  return cleanedSentences
}

const enablePageEditing = () => {
  document.designMode = 'on'
}

const disablePageEditing = () => {
  document.designMode = 'off'

  // if (window && window.getSelection) {
  //   window.getSelection().collapse(document.body, 0)
  // }
}

const handleMessage = (request: any) => {
  if (request.topic === "TabUpdated") {
    analyzeArticle(request.payload.url)
  } else if (request.topic === "AnalyzeButtonClicked") {
    analyzeArticle(request.payload.url)
  }
}

chrome.runtime.onMessage.addListener(handleMessage)
