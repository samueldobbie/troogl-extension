import React from "react"
import { render } from "react-dom"

function Popup(): JSX.Element {
  return (
    <div>
      Hello, World!
    </div>
  )
}

render(<Popup />, document.getElementById("root"))
