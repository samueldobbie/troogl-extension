import { Button } from "@mui/material"
import React from "react"
import DashboardMode from "../../commons/vo/DashboardMode"

interface IProps {
  setMode: (mode: string) => void
}

function HiddenDashboard(props: IProps): JSX.Element {
  const { setMode } = props

  return (
    <Button
      variant="contained"
      onClick={() => setMode(DashboardMode.Partial)}
      sx={{
        position: "fixed",
        bottom: 0,
        right: "5%",
        fontWeight: "bold",
        zIndex: 2147483647,
        backgroundColor: "primary.main",
        color: "text.secondary"
      }}
    >
      Show Dashboard
    </Button>
  )
}

export default HiddenDashboard
