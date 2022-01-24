import React, { useEffect, useState } from "react"
import { render } from "react-dom"
import { Paper } from "@mui/material"
import { ThemeProvider } from "@emotion/react"
import { theme } from "commons/Theme"
import AnalyzeButton from "./components/analyze/AnalyzeButton"
import SettingsMenu from "./components/settings/SettingsMenu"

function Popup(): JSX.Element {
  const [activeUrl, setActiveUrl] = useState("")
  const [originUrl, setOriginUrl] = useState("")

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

  return (
    <ThemeProvider theme={theme}>≈
      <Paper
        sx={{
          height: "100%",
          textAlign: "center",
          padding: 2,
        }}
      >
        <AnalyzeButton activeUrl={activeUrl} />
        <SettingsMenu originUrl={originUrl} />
      </Paper>
    </ThemeProvider>
  )
}

render(<Popup />, document.getElementById("root"))
