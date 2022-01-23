import { Button } from "@mui/material"
import React, { useState, useEffect } from "react"

interface IProps {
  originUrl: string
}

function AnalyzeDomainToggle(props: IProps): JSX.Element {
  const { originUrl } = props

  const [isOriginEnabled, setIsOriginEnabled] = useState(true)

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
    if (originUrl !== "") {
      chrome.storage.sync.get("disabledUrls", (item) => {
        const disabledUrls = (item.disabledUrls || []) as string[]
        const isEnabled = !disabledUrls.includes(originUrl)
        setIsOriginEnabled(isEnabled)
      })
    }
  }, [originUrl])

  return (
    <>
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
    </>
  )
}

export default AnalyzeDomainToggle
