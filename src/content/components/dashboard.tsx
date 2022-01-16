import { Button, Container, Grid, IconButton, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import React, { useState } from "react"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import Draggable from "react-draggable"
import { ISentence } from "../commons/interfaces/sentence"
import LineChart from "./line-chart"
import { ThemeProvider } from "@emotion/react"
import { theme } from "../commons/configs/theme"
import CloseIcon from "@mui/icons-material/Close"

interface IProps {
  sentences: ISentence[]
}

function Dashboard(props: IProps): JSX.Element {
  const { sentences } = props

  const [mode, setMode] = useState("partial")

  return (
    <ThemeProvider theme={theme}>
      {mode === "hidden" &&
        <CollapsedDashboard
          setMode={setMode}
        />
      }

      {mode === "partial" &&
        <PartialDashboard
          sentences={sentences}
          setMode={setMode}
        />
      }

      {mode === "full" &&
        <FullDashboard
          sentences={sentences}
          setMode={setMode}
        />
      }
    </ThemeProvider>
  )
}

interface ICollapsedProps {
  setMode: (mode: string) => void
}

function CollapsedDashboard(props: ICollapsedProps): JSX.Element {
  const { setMode } = props

  return (
    <Button
      variant="contained"
      onClick={() => setMode("partial")}
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

interface IPartialDashboardProps {
  sentences: ISentence[]
  setMode: (mode: string) => void
}

function PartialDashboard(props: IPartialDashboardProps): JSX.Element {
  const { sentences, setMode } = props

  const [metricType, setMetricType] = useState("entity")

  const toggleMetricType = (type: string | null) => {
    if (type) {
      setMetricType(type)
    }
  }

  return (
    <div
      id="troogl-dashboard-container"
      style={{ height: "100vh" }}
    >
      <Draggable
        axis="y"
        handle="#troogl-drag-handler"
        bounds="#troogl-dashboard-container"
        defaultPosition={{ x: 0, y: 0 }}
      >
        <Grid
          container
          spacing={0}
          alignItems="center"
          sx={{
            bottom: 0,
            left: 0,
            zIndex: 2147483647,
            position: "fixed",
            width: "100vw",
            height: "10vh",
            textAlign: "center",
            boxShadow: "0 0 5px #333",
            backgroundColor: "primary.main",
          }}
        >
          <Grid item xs={1}>
            <DragIndicatorIcon
              id="troogl-drag-handler"
              sx={{
                fontSize: "3rem",
                cursor: "grab",
                color: "text.secondary"
              }}
            />
          </Grid>

          <Grid item xs={3}>
            <ToggleButtonGroup
              exclusive
              value={metricType}
              onChange={(_, type) => toggleMetricType(type)}
              sx={{ backgroundColor: "#ECEDED" }}
            >
              <ToggleButton value="entity">
                Entity
              </ToggleButton>

              <ToggleButton value="subjectivity">
                Subjectivity
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={6}>
            <LineChart sentences={sentences} />
          </Grid>

          <Grid item xs={2}>
            <Button
              variant="contained"
              color="secondary"
              onClick={(): void => setMode("full")}
              sx={{ marginRight: 1 }}
            >
              Expand
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={(): void => setMode("hidden")}
            >
              Hide
            </Button>
          </Grid>
        </Grid>
      </Draggable>
    </div>
  )
}

interface IFullDashboardProps {
  sentences: ISentence[]
  setMode: (mode: string) => void
}

function FullDashboard(props: IFullDashboardProps): JSX.Element {
  const { sentences, setMode } = props

  const [metricType, setMetricType] = useState("entity")
  
  const text = sentences.map(sentence => sentence.text).join(" ")
  const summary = sentences.slice(0, 200)

  const toggleMetricType = (type: string | null) => {
    if (type) {
      setMetricType(type)
    }
  }

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
        onClick={() => setMode("partial")}
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

export default Dashboard
