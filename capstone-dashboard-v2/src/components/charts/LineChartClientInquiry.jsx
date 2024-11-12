import React, { useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  TbChevronLeft,
  TbChevronRight,
  TbDownload,
  TbFileTypeCsv,
  TbFileTypePng,
} from "react-icons/tb";

const LineChartClientInquiry = ({ projects = [] }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [openDownload, setOpenDownload] = useState(false);

  const chartRef = useRef(null);

  const monthlyInquiries = Array(12).fill(0);

  projects
    .filter(
      (project) =>
        project.jobStatus !== "cancelled" &&
        project.originalStatus !== "cancelled" &&
        new Date(project.createdAt).getFullYear() === year,
    )
    .forEach((project) => {
      if (project.createdAt) {
        const date = new Date(project.createdAt);
        const month = date.getMonth();
        monthlyInquiries[month] += 1;
      }
    });

  // Handle CSV download
  const downloadCSV = () => {
    const csvHeader = ["Month", "Client Count"];
    const csvRows = monthlyInquiries.map((inquiries, index) => [
      [
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
      ][index],
      inquiries,
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," + csvHeader.join(",") + "\n";
    csvRows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `client_inquiries_${year}.csv`);
    link.click();
  };

  const downloadPNG = () => {
    if (chartRef.current) {
      const chartImage = chartRef.current.toBase64Image();
      const link = document.createElement("a");
      link.href = chartImage;
      link.download = `client_inquiries_${year}.png`;
      link.click();
    }
  };

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => setYear((prev) => prev - 1)} className="p-2">
            <div className="rounded-lg border p-1 active:bg-secondary-50">
              <TbChevronLeft />
            </div>
          </button>
          <span className="mx-2 select-none text-sm font-bold">{year}</span>
          <button
            onClick={() =>
              setYear((prev) => Math.min(prev + 1, new Date().getFullYear()))
            }
            className="p-2"
          >
            <div
              className={`${
                year === new Date().getFullYear() && "opacity-50"
              } rounded-lg border p-1 active:bg-secondary-50`}
            >
              <TbChevronRight />
            </div>
          </button>
        </div>

        <div className="relative">
          <button
            className="p-2"
            onClick={() => setOpenDownload((prev) => !prev)}
          >
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
                  onClick={downloadPNG}
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

      {/* Line Chart Component */}
      <Line
        ref={chartRef}
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
              label: `Client Count Per Month - ${year}`,
              data: monthlyInquiries,
              fill: true,
              tension: 0.5,
              borderColor: "#FF8C00",
              backgroundColor: "rgba(255, 140, 0, 0.5)",
            },
          ],
        }}
        options={{
          plugins: {
            legend: { display: true },
          },
          scales: {
            x: { display: true },
            y: { display: true, beginAtZero: true },
          },
        }}
      />
    </div>
  );
};

export default LineChartClientInquiry;
