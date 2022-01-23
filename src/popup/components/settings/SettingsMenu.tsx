import { IconButton, Menu, MenuItem } from "@mui/material"
import React, { useEffect, useState } from "react"
import SettingsIcon from "@mui/icons-material/Settings"

function SettingsMenu(): JSX.Element {
  const [isAutoRunEnabled, setIsAutoRunEnabled] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const enableAutoRun = () => {
    chrome.storage.sync.set({ autoRun: true })
    setIsAutoRunEnabled(true)
  }

  const disableAutoRun = () => {
    chrome.storage.sync.set({ autoRun: false })
    setIsAutoRunEnabled(false)
  }

  const handleWriteReview = () => {
    window.open("https://google.com")
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
      <IconButton onClick={handleClick}>
        <SettingsIcon />
      </IconButton>

      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
      >
        {isAutoRunEnabled == false &&        
          <MenuItem onClick={enableAutoRun}>
            Enable auto-run (all websites)
          </MenuItem>
        }

        {isAutoRunEnabled == true &&        
          <MenuItem onClick={disableAutoRun}>
            Disable auto-run (all websites)
          </MenuItem>
        }

        <MenuItem onClick={handleWriteReview}>
          Write review
        </MenuItem>
      </Menu>
    </>
  )
}

export default SettingsMenu
