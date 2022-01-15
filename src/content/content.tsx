import extractor from "unfluffjs"
import tokenizer from "sbd"
import Sentiment from "sentiment"
import React from "react"
import ReactDOM from "react-dom"
import { CircularProgress } from "@mui/material"

declare global {
  interface Window {
      find: (text: string) => boolean
  }
}

// TODO subjectivity
const html = document.documentElement.innerHTML
const sentiment = new Sentiment()

const analyzeArticle = (url: string) => {
  if (hasBeenAnalyzed()) return

  addLoader()

  const sentences = getSentences(html).map(sentence => {
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

  removeLoader()
}

const addLoader = () => {
  addContainer("div", "troogl-loader")
  ReactDOM.render(<Abc />, document.getElementById("troogl-loader"))
}

const addContainer = (tagName: string, id: string) => {
  const container = document.createElement(tagName)
  container.id = id
  document.body.appendChild(container)
}

const removeLoader = () => {
  const loader = document.getElementById("troogl-loader")
  
  if (loader) {
    document.body.removeChild(loader)
  }
}

function Abc(): JSX.Element {
  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        zIndex: "2147483647",
        backgroundColor: "black",
        opacity: "0.7",
      }}
    >
      // center the loader
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <CircularProgress />
      </div>
    </div>
  )
}

const hasBeenAnalyzed = () => {
  return document.getElementById("troogl-extension") !== null
}

const getSentences = (html: string) => {  
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
