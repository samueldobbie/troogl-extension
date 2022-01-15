import { CircularProgress } from "@mui/material"
import React from "react"
import ReactDOM from "react-dom"
import { injectElement } from "../utils/page"

function Loader(): JSX.Element {
  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        zIndex: "2147483647",
        backgroundColor: "black",
        opacity: "0.7",
      }}
    >
      // center the loader
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <CircularProgress />
      </div>
    </div>
  )
}

function injectLoader() {
  injectElement("div", "troogl-loader")
  const container = document.getElementById("troogl-loader")
  ReactDOM.render(<Loader />, container)
}

function removeLoader() {
  const loader = document.getElementById("troogl-loader")
  
  if (loader) {
    document.body.removeChild(loader)
  }
}

export default Loader

export { injectLoader, removeLoader }
