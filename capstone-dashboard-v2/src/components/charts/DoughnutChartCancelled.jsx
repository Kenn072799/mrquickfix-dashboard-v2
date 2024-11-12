import React from "react";
import { Chart as ChartJS } from "chart.js/auto";
import { Doughnut } from "react-chartjs-2";

const DoughnutChartCancelled = ({ projects = [] }) => {
  const onProcessCount = projects.filter(
    (project) => project.jobPreviousStatus === "on process",
  ).length;

  const inProgressCount = projects.filter(
    (project) => project.jobPreviousStatus === "in progress",
  ).length;
  return (
    <div className="h-full w-full">
      <Doughnut
        data={{
          labels: ["On Process", "In Progress"],
          datasets: [
            {
              label: "Cancelled",
              data: [onProcessCount, inProgressCount],
              backgroundColor: ["#3b82f6", "#FF8C00"],
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

      <div className="pt-2">
        <span className="flex justify-between text-sm font-semibold">
          <span className="text-[#3b82f6]">On Process: {onProcessCount} </span>
          <span className="text-[#eab308]">
            In Progress: {inProgressCount}{" "}
          </span>
        </span>
      </div>
    </div>
  );
};

export default DoughnutChartCancelled;
