import React from "react";
import { Chart as ChartJS } from "chart.js/auto";
import { Doughnut } from "react-chartjs-2";

const DoughnutChartCancelled = () => {
  return (
    <div className="h-full w-full">
      <Doughnut
        data={{
          labels: ["On Process", "In Progress"],
          datasets: [
            {
              label: "Cancelled",
              data: [13, 7],
              backgroundColor: ["#3b82f6", "#eab308"],
            },
          ],
        }}
        options={{
          plugins: {
            legend: {
              display: true,
            },
          },
          scales: {
            x: {
              display: false,
            },
          },
        }}
      />
    </div>
  );
};

export default DoughnutChartCancelled;
