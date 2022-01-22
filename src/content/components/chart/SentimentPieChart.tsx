import React from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import { ISentimentPieChart } from "../../commons/interfaces/IArticle"

ChartJS.register(ArcElement, Tooltip, Legend)

interface IProps {
  chartData: ISentimentPieChart
}

function SentimentPieChart(props: IProps): JSX.Element {
  const { chartData } = props

  const labels = [
    "Positive",
    "Neutral",
    "Negative",
  ]

  const scores = [
    chartData.positive,
    chartData.neutral,
    chartData.negative,
  ]

  console.log(chartData)
  console.log(scores)

  const data = {
    labels,
    datasets: [
      {
        label: "Sentiment",
        data: scores,
        backgroundColor: [
          "rgba(183, 255, 197, 0.6)",
          "rgba(227, 227, 227, 0.6)",
          "rgba(255, 193, 193, 0.6)",
        ],
        borderColor: [
          "rgba(183, 255, 197, 1)",
          "rgba(227, 227, 227, 1)",
          "rgba(255, 193, 193, 1)",
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

export default SentimentPieChart
