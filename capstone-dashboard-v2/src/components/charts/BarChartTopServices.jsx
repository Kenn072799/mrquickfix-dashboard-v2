import React from "react";
import { Chart as ChartJS } from "chart.js/auto";
import { Bar } from "react-chartjs-2";

const BarChartTopServices = () => {
  return (
    <div className="h-full w-full">
      <Bar
        data={{
          labels: [
            "Fits-outs",
            "Electrical Works",
            "Kitchen and Bath Renovation",
            "Aircon Services",
            "Door and Window Repairs",
            "Outdoor and Landscaping",
            "Household Cleaning Services",
          ],
          datasets: [
            {
              label: "Count",
              data: [5, 13, 9, 12, 25, 18, 13],
              backgroundColor: [
                "rgba(255, 99, 132, 0.6)",
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
                "rgba(153, 102, 255, 0.6)",
                "rgba(255, 159, 64, 0.6)",
                "rgba(99, 255, 132, 0.6)",
              ],
              borderRadius: 5,
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
              display: false,
            },
          },
        }}
      />
    </div>
  );
};

export default BarChartTopServices;
