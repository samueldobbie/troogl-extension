import React, { useEffect, useState } from "react"
import { render } from "react-dom"
import { Button, Paper } from "@mui/material"
import { ThemeProvider } from "@emotion/react"
import { theme } from "../commons/Theme"

function Popup(): JSX.Element {
  const [activeUrl, setActiveUrl] = useState("")
  const [originUrl, setOriginUrl] = useState("")
  
  const analyzePage = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const tabId = tabs[0].id
  
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          topic: "TrooglButtonClicked",
          payload: { url: activeUrl },
        })
      }
    })
  }

  const disableOnOrigin = () => {
    alert(1)
  }

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
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

        <Button
          fullWidth
          onClick={disableOnOrigin}
          variant="text"
          color="error"
          sx={{ fontSize: 10 }}
        >
          Disable on {originUrl}
        </Button>
      </Paper>
    </ThemeProvider>
  )
}

render(<Popup />, document.getElementById("root"))
