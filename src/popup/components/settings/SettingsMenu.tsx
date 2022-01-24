import { IconButton, Menu, MenuItem } from "@mui/material"
import React, { useState } from "react"
import SettingsIcon from "@mui/icons-material/Settings"
import GlobalDomainToggle from "./GlobalDomainToggle"
import CurrentDomainToggle from "./CurrentDomainToggle"

interface IProps {
  originUrl: string
}

function SettingsMenu(props: IProps): JSX.Element {
  const { originUrl } = props

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleWriteReview = () => {
    window.open("https://google.com")
  }

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
        <CurrentDomainToggle originUrl={originUrl} />

        <GlobalDomainToggle />

        <MenuItem onClick={handleWriteReview} dense>
          Write review 🤞
        </MenuItem>
      </Menu>
    </>
  )
}

export default SettingsMenu
