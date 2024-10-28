import React from "react";
import { Chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";

const LineChartClientInquiry = () => {
  return (
    <div className="h-full w-full">
      <Line
        data={{
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Client Count",
              data: [5, 13, 9, 12, 25, 18, 13, 9, 12, 19],
              fill: true,
              tension: 0.5,
              borderColor: "#FF8C00",
              backgroundColor: "rgba(255, 140, 0, 0.5)",
            },
          ],
        }}
        options={{
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              display: true,
            },
          },
        }}
      />
    </div>
  );
};

export default LineChartClientInquiry;
