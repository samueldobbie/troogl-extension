import { Grid, ToggleButton, ToggleButtonGroup } from "@mui/material"
import React, { useState } from "react"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import Draggable from "react-draggable"

function Dashboard(): JSX.Element {
  const [type, setType] = useState("entity")

  const handleType = (type: string) => {
    setType(type)
  }

  return (
    <div
      id="dsadasds"
      style={{ height: "100vh" }}
    >
      <Draggable
        axis="y"
        bounds="#dsadasds"
        defaultPosition={{ x: 0, y: 0 }}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
          sx={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "12.5vh",
            backgroundColor: "rgb(83, 51, 237)",
            boxShadow: "0 0 5px #333",
            textAlign: "center",
            zIndex: "2147483647",
          }}
        >
          <Grid item xs={2}>
            <DragIndicatorIcon
              sx={{
                fontSize: "3rem",
                color: "white",
              }}
            />
          </Grid>

          <Grid item xs={2}>
            <ToggleButtonGroup
              exclusive
              value={type}
              onChange={(_, type) => handleType(type)}
              sx={{ backgroundColor: "white" }}
            >
              <ToggleButton value="entity">
                Entity
              </ToggleButton>

              <ToggleButton value="subjectivity">
                Subjectivity
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={4}>
            <DragIndicatorIcon
              sx={{
                fontSize: "3rem",
                color: "white",
              }}
            />
          </Grid>

          <Grid item xs={2}>
            <DragIndicatorIcon
              sx={{
                fontSize: "3rem",
                color: "white",
              }}
            />
          </Grid>
        </Grid>
      </Draggable>
    </div>

    // <Container
    //   style={{
    //     position: "relative",
    //     width: "100%",
    //     height: "12.5vh",
    //   }}
    // >
    //   <Box
    //     style={{
    //       position: "fixed",
    //       width: "100%",
    //       height: "12.5vh",
    //       top: "0",
    //       left: "0",
    //       display: "flex",
    //       flexWrap: "nowrap",
    //       alignItems: "center",
    //       backgroundColor: "rgb(83, 51, 237)",
    //       boxShadow: "0 0 5px #333",
    //       padding: "0 2%",
    //       fontFamily: "Tahoma, Geneva, sans-serif",
    //       zIndex: "10000",
    //     }}
    //   >

    //   </Box>
    // </Container>
  )
}

export default Dashboard
