import { Button, Grid, ToggleButton, ToggleButtonGroup } from "@mui/material"
import React, { useState } from "react"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import Draggable from "react-draggable"
import Graph from "./graph"
import { ISentenceData } from "../analyze-html"

interface IProps {
  sentenceData: ISentenceData[]
}

function Dashboard(props: IProps): JSX.Element {
  const { sentenceData } = props

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
            position: "fixed",
            bottom: 0,
            left: 0,
            zIndex: 2147483647,
            width: "100vw",
            height: "12.5vh",
            textAlign: "center",
            boxShadow: "0 0 5px #333",
            backgroundColor: "rgb(93 123 255)",
          }}
        >
          <Grid item xs={1}>
            <DragIndicatorIcon
              id="troogl-drag-handler"
              sx={{
                fontSize: "3rem",
                color: "#ECEDED",
                cursor: "grab",
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
            <Graph sentenceData={sentenceData} />
          </Grid>

          <Grid item xs={2}>
            <Button
              variant="contained"
              sx={{
                marginRight: 1,
                backgroundColor: "#ECEDED",
                color: "#333",
              }}
            >
              Expand
            </Button>

            <Button
              variant="contained"
              sx={{
                backgroundColor: "#ECEDED",
                color: "#333",
              }}
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
