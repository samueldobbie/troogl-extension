import React from "react"
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js"
import { Line } from "react-chartjs-2"
import { ISentenceData } from "../analyze-html"

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

interface IProps {
  sentenceData: ISentenceData[]
}

function Graph(props: IProps): JSX.Element {
  const { sentenceData } = props

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    elements: {
      line: {
        borderColor: "#ECEDED",
        borderWidth: 4,
      },
      point: {
        radius: 5,
      }
    },
    tooltips: {
      enabled: false,
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
        min: -1,
        max: 1  
      },
    }
  }
  
  const labels = sentenceData.map((item) => item.sentimentData.label)
  
  const data = {
    labels,
    datasets: [{
      data: sentenceData.map((item) => item.sentimentData.score),
      pointBackgroundColor: function(context: any): string {
        const index = context.dataIndex
        const label = labels[index]
  
        if (label == "positive") {
          return "rgb(183 255 197)"
        } else if (label == "neutral") {
          return "rgb(227 227 227)"
        } else {
          return "rgb(255 193 193)"
        }
      }
    }],
  }

  return (
    <div
      style={{
        height: "10vh",
        padding: "10px",
      }}
    >
      <Line
        options={options}
        data={data}
      />
    </div>
  )
}

export default Graph
