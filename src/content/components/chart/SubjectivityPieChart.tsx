import React from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import { ISubjectivityPieChart } from "../../commons/interfaces/IArticle"

ChartJS.register(ArcElement, Tooltip, Legend)

interface IProps {
  chartData: ISubjectivityPieChart
}

function SubjectivityPieChart(props: IProps): JSX.Element {
  const { chartData } = props

  const labels = [
    "Objective",
    "Subjective",
  ]

  const scores = [
    chartData.objective,
    chartData.subjective,
  ]

  const data = {
    labels,
    datasets: [
      {
        label: "Sentiment",
        data: scores,
        backgroundColor: [
          "rgba(227, 227, 227, 0.6)",
          "rgba(255, 200, 133, 0.6)",
        ],
        borderColor: [
          "rgba(227, 227, 227, 1)",
          "rgba(255, 200, 133, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div style={{ width: "75%" }}>
      <Pie data={data} />
    </div>
  )
}

export default SubjectivityPieChart
