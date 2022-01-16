import React, { useRef } from "react"
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, ChartEvent, ActiveElement } from "chart.js"
import { Line } from "react-chartjs-2"
import { ChartJSOrUndefined } from "react-chartjs-2/dist/types"
import { ISentence } from "../commons/interfaces/sentence"

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
)

interface IProps {
  sentences: ISentence[]
}

function Graph(props: IProps): JSX.Element {
  const { sentences } = props

  const chartRef = useRef<ChartJSOrUndefined<"line">>(null)
  const labels = sentences.map((item) => item.sentiment.label)

  const data = {
    labels,
    datasets: [{
      data: sentences.map((item) => item.sentiment.score),
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
        min: -1,
        max: 1  
      },
    },
    onHover: (event: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length > 0) {
        const sentenceIndex = elements[0].index
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
        ref={chartRef}
      />
    </div>
  )
}

export default Graph
