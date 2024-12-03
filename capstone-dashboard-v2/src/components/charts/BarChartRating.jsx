import React, { useState, useRef } from "react";
import { Chart as ChartJS } from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { TbDownload, TbFileTypeCsv, TbFileTypePng } from "react-icons/tb";

const DoughnutChartRating = ({ testimonials = [] }) => {
  const [openDownload, setOpenDownload] = useState(false);
  const chartRef = useRef(null);

  const ratings = {
    5: testimonials.filter((testimonial) => testimonial.rating === 5).length,
    4: testimonials.filter((testimonial) => testimonial.rating === 4).length,
    3: testimonials.filter((testimonial) => testimonial.rating === 3).length,
    2: testimonials.filter((testimonial) => testimonial.rating === 2).length,
    1: testimonials.filter((testimonial) => testimonial.rating === 1).length,
  };

  const totalRatings = Object.values(ratings).reduce((a, b) => a + b, 0);
  const weightedSum = Object.entries(ratings).reduce(
    (sum, [rating, count]) => sum + rating * count,
    0,
  );
  const averageRating = totalRatings
    ? (weightedSum / totalRatings).toFixed(1)
    : 0;

  const handleDownload = () => {
    setOpenDownload(!openDownload);
  };

  const downloadChartAsImage = () => {
    if (chartRef.current) {
      const chartCanvas = chartRef.current.canvas;
      const imageUrl = chartCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `customer-ratings-chart.png`;
      link.click();
    }
  };

  const downloadCSV = () => {
    const data = [
      ["Rating", "Count", "Percentage"],
      ...Object.entries(ratings)
        .reverse()
        .map(([rating, count]) => [
          `${rating} Stars`,
          count,
          `${((count / totalRatings) * 100).toFixed(1)}%`,
        ]),
    ];

    const csv = data.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `customer-ratings-data.csv`;
    link.click();
  };

  return (
    <div className="h-full w-full">
      <div className="flex justify-end">
        {/* Download Options */}
        <div className="relative">
          <button className="p-2" onClick={handleDownload}>
            <div className="rounded-lg border p-1 active:bg-secondary-50">
              <TbDownload />
            </div>
          </button>
          {openDownload && (
            <div className="absolute right-0 top-8 flex flex-col rounded-md border bg-white text-sm shadow-md">
              <div className="flex flex-col whitespace-nowrap">
                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-2 px-3 py-1 font-bold hover:bg-secondary-50"
                >
                  <TbFileTypeCsv className="text-[20px] text-green-500" />
                  Download as CSV
                </button>
                <button
                  onClick={downloadChartAsImage}
                  className="flex items-center gap-2 px-3 py-1 font-bold hover:bg-secondary-50"
                >
                  <TbFileTypePng className="text-[20px] text-blue-500" />
                  Download as PNG
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Bar
        ref={chartRef}
        data={{
          labels: ["5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Star"],
          datasets: [
            {
              label: "Ratings",
              data: [
                ratings[5],
                ratings[4],
                ratings[3],
                ratings[2],
                ratings[1],
              ],
              backgroundColor: [
                "#22c55e", // Green for 5 stars
                "#84cc16", // Light green for 4 stars
                "#eab308", // Yellow for 3 stars
                "#f97316", // Orange for 2 stars
                "#ef4444", // Red for 1 star
              ],
              borderRadius: 5,
            },
          ],
        }}
        options={{
          plugins: {
            title: {
              display: true,
              text: `Average Rating: ${averageRating} ⭐`,
            },
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw || 0;
                  const percentage = totalRatings
                    ? ((value / totalRatings) * 100).toFixed(1)
                    : 0;
                  return `Count: ${value} (${percentage}%)`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        }}
      />
    </div>
  );
};

export default DoughnutChartRating;
