import { Button, MenuItem } from "@mui/material"
import React, { useState, useEffect } from "react"

interface IProps {
  originUrl: string
}

function CurrentDomainToggle(props: IProps): JSX.Element {
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
        <MenuItem onClick={enableOrigin} dense>
          Enable article detection (this site)
        </MenuItem>
      }

      {isOriginEnabled == true &&
        <MenuItem onClick={disableOrigin} dense>
          Disable article detection (this site)
        </MenuItem>
      }
    </>
  )
}

export default CurrentDomainToggle
