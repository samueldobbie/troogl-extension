import React, { useEffect, useState } from "react"
import { render } from "react-dom"
import { Button, Paper } from "@mui/material"
import { ThemeProvider } from "@emotion/react"
import { theme } from "../commons/Theme"

function Popup(): JSX.Element {
  const [activeUrl, setActiveUrl] = useState("")
  const [originUrl, setOriginUrl] = useState("")
  const [isOriginEnabled, setIsOriginEnabled] = useState(true)
  
  const analyzePage = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id
  
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          topic: "AnalyzeButtonClicked",
          payload: { url: activeUrl },
        })
      }
    })
  }

  const enableOrigin = () => {
    chrome.storage.sync.get("disabledUrls", (item) => {
      const disabledUrls = (item.disabledUrls || []) as string[]
      const updatedUrls = disabledUrls.filter((url) => url !== originUrl)
      chrome.storage.sync.set({ disabledUrls: updatedUrls })
      chrome.tabs.reload()
      setIsOriginEnabled(true)
    })
  }

  const disableOrigin = () => {
    chrome.storage.sync.get("disabledUrls", (item) => {
      const disabledUrls = (item.disabledUrls || []) as string[]
      disabledUrls.push(originUrl)
      chrome.storage.sync.set({ disabledUrls })
      chrome.tabs.reload()
      setIsOriginEnabled(false)
    })
  }

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url

      if (url) {
        setActiveUrl(url)
      }
    })
  }, [])

  useEffect(() => {
    if (activeUrl !== "") {
      const url = new URL(activeUrl)
      setOriginUrl(url.hostname)
    }
  }, [activeUrl])

  useEffect(() => {
    if (originUrl !== "") {
      chrome.storage.sync.get("disabledUrls", (item) => {
        const disabledUrls = (item.disabledUrls || []) as string[]
        const isEnabled = !disabledUrls.includes(originUrl)
        setIsOriginEnabled(isEnabled)
      })
    }
  }, [originUrl])

  return (
    <ThemeProvider theme={theme}>≈
      <Paper
        sx={{
          height: "100%",
          textAlign: "center",
          padding: 2,
        }}
      >
        <Button
          fullWidth
          onClick={analyzePage}
          variant="contained"
          color="primary"
          sx={{
            marginBottom: 1,
            color: "white",
            fontWeight: "bold",
          }}
        >
          Troogl This Page
        </Button>

        {isOriginEnabled == false &&
          <Button
            fullWidth
            onClick={enableOrigin}
            variant="text"
            color="success"
            sx={{
              fontSize: 11,
              fontWeight: "bold",
            }}
          >
            Enable on {originUrl}
          </Button>
        }

        {isOriginEnabled == true &&
          <Button
            fullWidth
            onClick={disableOrigin}
            variant="text"
            color="error"
            sx={{
              fontSize: 11,
              fontWeight: "bold",
            }}
          >
            Disable on {originUrl}
          </Button>
        }
      </Paper>
    </ThemeProvider>
  )
}

render(<Popup />, document.getElementById("root"))
