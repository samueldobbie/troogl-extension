import { Button } from "@mui/material"
import React from "react"

interface IProps {
  activeUrl: string
}

function AnalyzeButton(props: IProps): JSX.Element {
  const { activeUrl } = props

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

  return (
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
  )
}

export default AnalyzeButton
