import { ThemeProvider } from "@emotion/react"
import React, { useState } from "react"
import { theme } from "../../commons/configs/Theme"
import { ISentence } from "../../commons/interfaces/ISentence"
import DashboardMode from "../../commons/configs/DashboardMode"
import { appendJsxToBody } from "../../commons/utils/Page"
import FullDashboard from "./FullDashboard"
import HiddenDashboard from "./HiddenDashboard"
import PartialDashboard from "./PartialDashboard"

interface IProps {
  sentences: ISentence[]
}

function Dashboard(props: IProps): JSX.Element {
  const { sentences } = props

  const [mode, setMode] = useState(DashboardMode.Partial)

  return (
    <ThemeProvider theme={theme}>
      {mode === DashboardMode.Hidden &&
        <HiddenDashboard
          setMode={setMode}
        />
      }

      {mode === DashboardMode.Partial &&
        <PartialDashboard
          sentences={sentences}
          setMode={setMode}
        />
      }

      {mode === DashboardMode.Full &&
        <FullDashboard
          sentences={sentences}
          setMode={setMode}
        />
      }
    </ThemeProvider>
  )
}

function injectDashboard(sentences: ISentence[]): void {
  appendJsxToBody(<Dashboard sentences={sentences} />)
}

export default Dashboard

export { injectDashboard }
