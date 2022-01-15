import extractor from "unfluffjs"
import tokenizer from "sbd"
import Sentiment from "sentiment"

declare global {
  interface Window {
      find: (text: string) => boolean
  }
}

// TODO subjectivity

const sentiment = new Sentiment();

const analyzeArticle = (url: string) => {
  if (hasBeenAnalyzed()) return

  const sentences = getSentences(url).map(sentence => {
    const score = sentiment.analyze(sentence).score

    if (score > 4) {
      return {
        type: "positive",
        sentence,
      }
    } else if (score >= -4 && score <= 4) {
      return {
        type: "neutral",
        sentence,
      }
    } else {
      return {
        type: "negative",
        sentence,
      }
    }
  })

  enablePageEditing()
  window.getSelection()?.collapse(document.body, 0)

  for (let i = 0; i < sentences.length; i++) {
    if (window.find(sentences[i].sentence)) {
      const range = window.getSelection()?.getRangeAt(0)
  
      if (range) {
        const anchorTag = document.createElement("a")
        // anchorTag.id = `troogl-sentence-${i}`
    
        const sentenceContainer = document.createElement("span")
        sentenceContainer.appendChild(anchorTag)
        // sentenceContainer.setAttribute("troogl-sentence-index", i.toString())
        // sentenceContainer.classList.add("troogl-sentence")
        sentenceContainer.appendChild(range.extractContents())

        if (sentences[i].type === "positive") {
          sentenceContainer.style.backgroundColor = "#d3ffd3"
        } else if (sentences[i].type === "neutral") {
          sentenceContainer.style.backgroundColor = "#efefef"
        } else {
          sentenceContainer.style.backgroundColor = "#ffe6e6"
        }

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
  const sentences = [data.softTitle]

  tokenizer
    .sentences(data.text)
    .forEach(sentence => {
      const subSentences = sentence.split("\n")

      subSentences.forEach(subSentece => {
        if (subSentece !== "") {
          sentences.push(subSentece)
        }
      })
    })

  const cleanedSentences = sentences
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0)

  return cleanedSentences
}

const enablePageEditing = () => {
  document.designMode = "on"
}

const disablePageEditing = () => {
  document.designMode = "off"

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
