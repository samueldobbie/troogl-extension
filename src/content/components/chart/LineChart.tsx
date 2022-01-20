import { ActiveElement, CategoryScale, Chart, ChartEvent, LinearScale, LineElement, PointElement } from "chart.js"
import React from "react"
import { Line } from "react-chartjs-2"
import MetricType from "../../commons/configs/MetricType"
import { ISentence } from "../../commons/interfaces/ISentence"

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
)

interface IProps {
  sentences: ISentence[]
  metricType: string
}

function LineChart(props: IProps): JSX.Element {
  const { sentences, metricType } = props

  const labels = metricType == MetricType.Sentiment
    ? sentences.map((item) => item.sentiment.label)
    : sentences.map((item) => item.subjectivity.label)

  const scores = metricType == MetricType.Sentiment
    ? sentences.map((item) => item.sentiment.score)
    : sentences.map((item) => item.subjectivity.score)

  const minY = metricType == MetricType.Sentiment
    ? -1.1
    : -0.1

  const data = {
    labels,
    datasets: [{
      data: scores,
      pointBackgroundColor: function(context: any): string {
        const index = context.dataIndex
        const label = labels[index]
  
        if (metricType == MetricType.Sentiment) {
          if (label == "positive") {
            return "rgb(183, 255, 197)"
          } else if (label == "neutral") {
            return "rgb(227, 227, 227)"
          } else {
            return "rgb(255, 193, 193)"
          }
        } else {
          if (label == "subjective") {
            return "rgb(255, 200, 133)"
          } else {
            return "rgb(227, 227, 227)"
          }
        }
      },
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
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
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
        min: minY,
        max: 1.1,
      },
    },
    onHover: (event: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length > 0) {
        const sentenceIndex = Math.max(0, elements[0].index - 1)
        const sentenceElement = document.getElementById(`troogl-sentence-${sentenceIndex}`)

        if (sentenceElement) {
          sentenceElement.scrollIntoView({ behavior: "smooth" })
        }
      }
    },
  }

  return (
    <div
      style={{
        height: "10vh",
        padding: "10px",
      }}
    >
      <Line
        data={data}
        options={options}
      />
    </div>
  )
}

export default LineChart
