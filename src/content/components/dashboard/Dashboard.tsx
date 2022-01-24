import { ThemeProvider } from "@emotion/react"
import React, { useEffect, useState } from "react"
import { theme } from "commons/Theme"
import IArticle from "content/commons/interfaces/IArticle"
import { appendJsxToBody } from "content/commons/utils/Page"
import DashboardMode from "content/commons/vo/DashboardMode"
import FullDashboard from "./FullDashboard"
import HiddenDashboard from "./HiddenDashboard"
import PartialDashboard from "./PartialDashboard"

interface IProps {
  article: IArticle
}

function Dashboard(props: IProps): JSX.Element {
  const { article } = props

  const [mode, setMode] = useState(DashboardMode.Partial)

  useEffect(() => {
    if (mode === DashboardMode.Full) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }, [mode])

  return (
    <ThemeProvider theme={theme}>
      {mode === DashboardMode.Hidden &&
        <HiddenDashboard
          setMode={setMode}
        />
      }

      {mode === DashboardMode.Partial &&
        <PartialDashboard
          sentences={article.sentences}
          setMode={setMode}
        />
      }

      {mode === DashboardMode.Full &&
        <FullDashboard
          article={article}
          setMode={setMode}
        />
      }
    </ThemeProvider>
  )
}

function injectDashboard(article: IArticle): void {
  appendJsxToBody(<Dashboard article={article} />)
}

export default Dashboard

export { injectDashboard }
