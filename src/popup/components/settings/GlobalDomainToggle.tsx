import { MenuItem } from "@mui/material"
import React, { useState, useEffect } from "react"

function GlobalDomainToggle(): JSX.Element {
  const [isAutoRunEnabled, setIsAutoRunEnabled] = useState(true)
  
  const enableAutoRun = () => {
    chrome.storage.sync.set({ autoRun: true })
    setIsAutoRunEnabled(true)
  }

  const disableAutoRun = () => {
    chrome.storage.sync.set({ autoRun: false })
    setIsAutoRunEnabled(false)
  }

  useEffect(() => {
    chrome.storage.sync.get("autoRun", (item) => {
      const autoRun = item.autoRun

      if (autoRun !== null && autoRun !== undefined) {
        setIsAutoRunEnabled(autoRun)
      }
    })
  }, [])

  return (
    <>
      {isAutoRunEnabled == false &&        
        <MenuItem onClick={enableAutoRun} dense>
          Enable article detection (all sites)
        </MenuItem>
      }

      {isAutoRunEnabled == true &&        
        <MenuItem onClick={disableAutoRun} dense>
          Disable article detection (all sites)
        </MenuItem>
      }
    </>
  )
}

export default GlobalDomainToggle
