import { Alert, Snackbar } from "@mui/material"
import React, { useState } from "react"
import { appendJsxToBody } from "../../commons/utils/Page"

interface IProps {
  message: string
}

function Toast(props: IProps): JSX.Element {
  const { message } = props

  const [open, setOpen] = useState(true)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div id="troogl-is-cool">
      <Snackbar
        open={open}
        onClose={handleClose}
        message={message}
        color="primary"
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      />
    </div>
  )
}

function injectToast(message: string): void {
  appendJsxToBody(<Toast message={message} />)
}


export default Toast

export { injectToast }
