import React from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import { ISentence } from "../../commons/interfaces/ISentence"
import MetricType from "../../commons/configs/MetricType"

ChartJS.register(ArcElement, Tooltip, Legend)

export const data = {
  labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  datasets: [
    {
      label: "# of Votes",
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    },
  ],
}

// interface IProps {
//   sentences: ISentence[]
//   metricType: string
// }

// props: IProps

function PieChart(): JSX.Element {
  // const { sentences, metricType } = props

  // const labels = metricType == MetricType.Sentiment
  //   ? sentences.map((item) => item.sentiment.label)
  //   : sentences.map((item) => item.subjectivity.label)

  // const scores = metricType == MetricType.Sentiment
  //   ? sentences.map((item) => item.sentiment.score)
  //   : sentences.map((item) => item.subjectivity.score)

  // const minY = metricType == MetricType.Sentiment
  //   ? -1.1
  //   : -0.1

  // const data = {
  //   labels,
  //   datasets: [{
  //     data: scores,
  //     pointBackgroundColor: function(context: any): string {
  //       const index = context.dataIndex
  //       const label = labels[index]
  
  //       if (metricType == MetricType.Sentiment) {
  //         if (label == "positive") {
  //           return "rgb(183, 255, 197)"
  //         } else if (label == "neutral") {
  //           return "rgb(227, 227, 227)"
  //         } else {
  //           return "rgb(255, 193, 193)"
  //         }
  //       } else {
  //         if (label == "subjective") {
  //           return "rgb(255, 200, 133)"
  //         } else {
  //           return "rgb(227, 227, 227)"
  //         }
  //       }
  //     },
  //   }],
  // }

  // const options = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   interaction: {
  //     mode: "nearest" as const,
  //     axis: "x" as const,
  //     intersect: false,
  //   },
  //   elements: {
  //     line: {
  //       borderColor: "#ECEDED",
  //       borderWidth: 4,
  //     },
  //     point: {
  //       radius: 5,
  //     }
  //   },
  //   scales: {
  //     x: {
  //       display: false,
  //     },
  //     y: {
  //       display: false,
  //       min: minY,
  //       max: 1.1,
  //     },
  //   },
  //   onHover: (event: ChartEvent, elements: ActiveElement[]) => {
  //     if (elements.length > 0) {
  //       const sentenceIndex = Math.max(0, elements[0].index - 1)
  //       const sentenceElement = document.getElementById(`troogl-sentence-${sentenceIndex}`)

  //       if (sentenceElement) {
  //         sentenceElement.scrollIntoView({ behavior: "smooth" })
  //       }
  //     }
  //   },
  // }

  return (
    <Pie
      // options={options}
      data={data}
    />
  )
}

export default PieChart












export function App() {
  return <Pie data={data} />
}
