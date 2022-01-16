import React from "react"
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js"
import { Line } from "react-chartjs-2"

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

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
    },
  }
}

const labels = [ "Positive", "Neutral", "Negative", "Negative", "Neutral", "Positive" ]

const data = {
  labels,
  datasets: [{
    data: [ 1, 0, -1, -1, 0, 1 ],
    pointBackgroundColor: function(context: any): string {
      const index = context.dataIndex
      const label = labels[index]

      if (label == "Positive") {
        return "rgb(183 255 197)"
      } else if (label == "Neutral") {
        return "rgb(227 227 227)"
      } else {
        return "rgb(255 193 193)"
      }
    }
  }],
}

function Graph(): JSX.Element {
  return (
    <div style={{ height: "10vh", padding: "10px" }}>
      <Line
        options={options}
        data={data}
      />
    </div>
  )
}

export default Graph
