import React, { useState, useRef } from "react";
import { Chart as ChartJS } from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import {
  TbChevronLeft,
  TbChevronRight,
  TbDownload,
  TbFileTypeCsv,
  TbFileTypePng,
} from "react-icons/tb";

const BarChartTopServices = ({ projects = [] }) => {
  const services = [
    "Fits-outs (Painting, Carpentry, Masonry)",
    "Electrical Works",
    "Kitchen and Bath Renovation",
    "Aircon Services",
    "Door and Window Repairs",
    "Outdoor and Landscaping",
    "Household Cleaning Services",
  ];

  const abbreviatedServices = ["F-O", "EW", "KBR", "AS", "DWR", "OL", "HCS"];

  const [year, setYear] = useState(new Date().getFullYear());
  const [openDownload, setOpenDownload] = useState(false);
  const chartRef = useRef(null);

  const serviceCount = Array(services.length).fill(0);

  projects
    .filter(
      (project) =>
        project.createdAt && new Date(project.createdAt).getFullYear() === year,
    )
    .forEach((project) => {
      if (
        project.jobStatus !== "cancelled" &&
        project.originalStatus !== "cancelled" &&
        project.jobServices &&
        Array.isArray(project.jobServices)
      ) {
        project.jobServices.forEach((service) => {
          const serviceIndex = services.indexOf(service);
          if (serviceIndex !== -1) {
            serviceCount[serviceIndex] += 1;
          }
        });
      }
    });

  const hasDataForYear = serviceCount.some((count) => count > 0);

  const topServiceIndex = hasDataForYear
    ? serviceCount.indexOf(Math.max(...serviceCount))
    : -1;
  const topService = topServiceIndex !== -1 ? services[topServiceIndex] : "N/A";

  const handleDownload = () => {
    setOpenDownload(!openDownload);
  };

  const downloadChartAsImage = () => {
    if (chartRef.current) {
      const chartCanvas = chartRef.current.canvas;
      const imageUrl = chartCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `top-services-chart-${year}.png`;
      link.click();
    }
  };

  const downloadCSV = () => {
    const data = [
      ["Service", "Count"],
      ...services.map((service, index) => [service, serviceCount[index]]),
    ];

    const csv = data.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `top-services-data-${year}.csv`;
    link.click();
  };

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between">
        {/* Year Navigation */}
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

      {/* Bar Chart */}
      <Bar
        ref={chartRef}
        data={{
          labels: services,
          datasets: [
            {
              label: "Service Count",
              data: serviceCount,
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
            title: {
              display: true,
              text: `Top Job Services in ${year} - (${topService})`,
            },
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              labels: abbreviatedServices,
              display: true,
              title: {
                display: false,
              },
            },
            y: {
              display: true,
              beginAtZero: true,
              title: {
                display: false,
              },
            },
          },
        }}
      />
    </div>
  );
};

export default BarChartTopServices;
