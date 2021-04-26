import { Chart } from "chart.js";
import numeral from "numeral";
import React, { useEffect } from "react";
import { useState } from "react";
import { Line } from "react-chartjs-2";

const options = {
  legend: {
    display: false,
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  maintainAspectRatio: false,
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label: function (tooltipItem, data) {
        return numeral(tooltipItem.value).format("+0,0");
      },
    },
  },
  scales: {
    xAxes: [
      {
        ticks: {
          fontColor: "#9e9d99",
        },

        type: "time",
        time: {
          format: "MM/DD/YY",
          tooltipFormat: "ll",
        },
      },
    ],
    yAxes: [
      {
        gridLines: {
          drawOnChartArea: false,
        },
        ticks: {
          fontColor: "#9e9d99",
          fontWeight: 600,
          // Include a dollar sign in the ticks
          callback: function (value, index, values) {
            return numeral(value).format("0a");
          },
        },
      },
    ],
  },
};
const buildChartData = (data, casesTypes) => {
  const chartData = [];
  let lastDataPoint;
  for (let date in data.cases) {
    if (lastDataPoint) {
      const newDataPoint = {
        x: date,
        y: data[casesTypes][date] - lastDataPoint,
      };
      chartData.push(newDataPoint);
    }
    lastDataPoint = data[casesTypes][date];
  }
  return chartData;
};

const Graph = ({ casesTypes }) => {
  const [data, setData] = useState({});

  useEffect(() => {
    const getTimeSeriesData = async () => {
      try {
        const response = await fetch(
          "https://disease.sh/v3/covid-19/historical/all?lastdays=120"
        );
        const results = await response.json();
        console.log(results);
        const chartData = buildChartData(results, casesTypes);
        console.log(chartData);
        setData(chartData);
      } catch (error) {
        console.error(error);
      }
    };
    getTimeSeriesData();
  }, [casesTypes]);

  return (
    <div>
      {data?.length > 0 && (
        <Line
          options={options}
          data={{
            datasets: [
              {
                data: data,
                label: casesTypes,
                fill: "start",
                backgroundColor: "rgba(204, 16, 52, 0.5)",
                borderColor: "#CC1034",
              },
            ],
          }}
        />
      )}
    </div>
  );
};

export default Graph;
