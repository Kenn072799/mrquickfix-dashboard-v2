import React, { useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  TbChevronLeft,
  TbChevronRight,
  TbDownload,
  TbFileTypeCsv,
  TbFileTypePng,
} from "react-icons/tb";

const LineChartCC = ({ projects = [] }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [openDownload, setOpenDownload] = useState(false);
  const chartRef = useRef(null);

  const monthlyCompletedInquiries = Array(12).fill(0);
  const monthlyOnProcessInquiries = Array(12).fill(0);
  const monthlyInProgressInquiries = Array(12).fill(0);

  projects
    .filter(
      (project) =>
        project.createdAt && new Date(project.createdAt).getFullYear() === year,
    )
    .forEach((project) => {
      const date = new Date(project.createdAt);
      const month = date.getMonth();

      if (
        project.jobStatus === "completed" ||
        project.originalStatus === "completed"
      ) {
        monthlyCompletedInquiries[month] += 1;
      }

      if (project.jobPreviousStatus === "on process") {
        monthlyOnProcessInquiries[month] += 1;
      }

      if (project.jobPreviousStatus === "in progress") {
        monthlyInProgressInquiries[month] += 1;
      }
    });

  const handleDownload = () => {
    setOpenDownload(!openDownload);
  };

  const downloadChartAsImage = () => {
    if (chartRef.current) {
      const chartCanvas = chartRef.current.canvas;
      const imageUrl = chartCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `completed-and-cancelled-project-${year}.png`;
      link.click();
    }
  };

  const downloadCSV = () => {
    const data = [
      ["Month", "Completed", "On Process Cancel", "In Progress Cancel"],
      ...monthlyCompletedInquiries.map((_, i) => [
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
        ][i],
        monthlyCompletedInquiries[i],
        monthlyOnProcessInquiries[i],
        monthlyInProgressInquiries[i],
      ]),
    ];

    const csv = data.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `completed-and-cancelled-project-${year}.csv`;
    link.click();
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
              label: "Completed",
              data: monthlyCompletedInquiries,
              tension: 0.5,
              borderColor: "#4caf50",
            },
            {
              label: "On Process Cancel",
              data: monthlyOnProcessInquiries,
              tension: 0.5,
              borderColor: "#2196f3",
            },
            {
              label: "In Progress Cancel",
              data: monthlyInProgressInquiries,
              tension: 0.5,
              borderColor: "#FF8C00",
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
              display: true,
            },
            y: {
              display: true,
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
};

export default LineChartCC;
