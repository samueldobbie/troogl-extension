import React from "react"
import { render } from "react-dom"
import { Button, Paper, TextField, Typography } from "@mui/material"

function Popup(): JSX.Element {
  return (
    <Paper
      sx={{
        height: "100%",
        textAlign: "center",
        padding: 2,
      }}
    >
      <Typography
        gutterBottom
        sx={{
          fontSize: 10,
          textAlign: "left",
        }}
      >
        Troogl will automatically analyze any page
        with a URL matching one of the wildcards below.
      </Typography>

      <TextField
        multiline
        fullWidth
        rows={10}
        label="Update Wildcards"
        placeholder="https://www.bbc.co.uk/news/*"
        variant="filled"
        sx={{ marginBottom: 2 }}
      />

      <Typography sx={{ marginBottom: 2 }}>
        --- OR ---
      </Typography>

      <Button
        fullWidth
        onClick={analyzePage}
        variant="contained"
      >
        Analyze open page
      </Button>
    </Paper>
  )
}

const analyzePage = () => {
  console.log(1)
  alert(2)
}

render(<Popup />, document.getElementById("root"))
