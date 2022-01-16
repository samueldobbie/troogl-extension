import { Button, Grid, ToggleButton, ToggleButtonGroup } from "@mui/material"
import React, { useState } from "react"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import Draggable from "react-draggable"
import { ISentence } from "../commons/interfaces/sentence"
import LineChart from "./line-chart"
import { ThemeProvider } from "@emotion/react"
import { theme } from "../commons/configs/theme"

interface IProps {
  sentences: ISentence[]
}

function Dashboard(props: IProps): JSX.Element {
  const { sentences } = props

  const [hide, setHide] = useState(false)

  return (
    <ThemeProvider theme={theme}>
      {
        hide
          ? <CollapsedDashboard setHide={setHide} />
          : <FullDashboard
              sentences={sentences}
              setHide={setHide}
            />
      }
    </ThemeProvider>
  )
}

interface ICollapsedProps {
  setHide: (hide: boolean) => void
}

function CollapsedDashboard(props: ICollapsedProps): JSX.Element {
  const { setHide } = props

  return (
    <Button
      variant="contained"
      onClick={() => setHide(false)}
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

interface IFullDashboardProps {
  sentences: ISentence[]
  setHide: (value: boolean) => void
}

function FullDashboard(props: IFullDashboardProps): JSX.Element {
  const { sentences, setHide } = props

  const [metricType, setMetricType] = useState("entity")

  const toggleMetricType = (type: string) => {
    setMetricType(type)
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
              sx={{ marginRight: 1 }}
            >
              Expand
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={(): void => setHide(true)}
            >
              Hide
            </Button>
          </Grid>
        </Grid>
      </Draggable>
    </div>
  )
}

export default Dashboard
