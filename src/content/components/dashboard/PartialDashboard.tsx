import { Grid, ToggleButtonGroup, ToggleButton, Button } from "@mui/material"
import React, { useEffect, useState } from "react"
import Draggable from "react-draggable"
import { ISentence } from "../../commons/interfaces/ISentence"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import LineChart from "../line-chart/LineChart"
import DashboardMode from "../../commons/configs/DashboardMode"
import MetricType from "../../commons/configs/MetricType"
import { injectSentenceWrappers } from "../../commons/utils/Sentence"

interface IProps {
  sentences: ISentence[]
  setMode: (mode: string) => void
}

function PartialDashboard(props: IProps): JSX.Element {
  const { sentences, setMode } = props

  const [metricType, setMetricType] = useState(MetricType.Sentiment)

  const toggleMetricType = (type: string | null) => {
    if (type) {
      setMetricType(type)
    }
  }

  useEffect(() => {
    injectSentenceWrappers(sentences, metricType)
  }, [metricType])

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
              <ToggleButton value={MetricType.Sentiment}>
                {MetricType.Sentiment}
              </ToggleButton>

              <ToggleButton value={MetricType.Subjectivity}>
                {MetricType.Subjectivity}
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={6}>
            <LineChart
              sentences={sentences}
              metricType={metricType}  
            />
          </Grid>

          <Grid item xs={2}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setMode(DashboardMode.Full)}
              sx={{ marginRight: 1 }}
            >
              Expand
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={() => setMode(DashboardMode.Hidden)}
            >
              Hide
            </Button>
          </Grid>
        </Grid>
      </Draggable>
    </div>
  )
}

export default PartialDashboard