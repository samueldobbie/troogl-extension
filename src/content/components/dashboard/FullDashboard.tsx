import { IconButton, Grid, Typography } from "@mui/material"
import React from "react"
import { ISentence } from "../../commons/interfaces/ISentence"
import CloseIcon from "@mui/icons-material/Close"
import DashboardMode from "../../commons/utils/DashboardMode"

interface IProps {
  sentences: ISentence[]
  setMode: (mode: string) => void
}

function FullDashboard(props: IProps): JSX.Element {
  const { sentences, setMode } = props

  const text = sentences.map(sentence => sentence.text).join(" ")
  const summary = text.slice(0, 200)

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        zIndex: 2147483647,
        backgroundColor: "#eceded",
      }}
    >
      <IconButton
        color="primary"
        onClick={() => setMode(DashboardMode.Partial)}
        sx={{
          position: "absolute",
          top: "2.5%",
          right: "2.5%",
        }}
      >
        <CloseIcon />
      </IconButton>

      <Grid
        container
        spacing={0}
        alignItems="center"
        sx={{
          marginTop: "5%",
          textAlign: "center",
        }}
      >
        <Grid item xs={12}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Summary
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {summary}
          </Typography>
        </Grid>

        <Grid item xs={3}>
          MORE DETAILS
        </Grid>

        <Grid item xs={9}>
          SOME LONGER DETAILS
        </Grid>
      </Grid>
    </div>
  )
}

export default FullDashboard
