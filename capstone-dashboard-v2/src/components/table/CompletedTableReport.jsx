import React, { useState } from "react";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  TbChevronLeft,
  TbChevronRight,
  TbDownload,
  TbFileTypeCsv,
  TbFileTypePdf,
  TbX,
} from "react-icons/tb";
import { Title } from "../props/Title";
import NoData from "../../assets/undraw_No_data_re_kwbl.png";

const CompletedTableReport = ({ projects, loading, error }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  const handleDownload = () => {
    setOpenModal(true);
  };

  const filteredProjects = projects.filter((project) => {
    const completedDate = new Date(project.jobCompletedDate);
    const isInDateRange =
      (!startDate || completedDate >= startDate) &&
      (!endDate || completedDate <= endDate);
    return project.originalStatus === "completed" && isInDateRange;
  });

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const totalPages = Math.ceil(filteredProjects.length / rowsPerPage);

  const handleCSVDownload = () => {
    const csvData = paginatedProjects.map((project) => ({
      "Project ID": project.projectID,
      "First Name": project.clientFirstName,
      "Last Name": project.clientLastName,
      "Job Type": project.jobType,
      Services: project.jobServices ? project.jobServices.join(", ") : "",
      Date: new Date(project.jobCompletedDate).toLocaleString("en-US", {
        hour12: true,
        minute: "2-digit",
        hour: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    }));

    const csv = Papa.unparse(csvData);

    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    link.download = "completed_projects_report.csv";
    link.click();
  };

  const handlePDFDownload = () => {
    const doc = new jsPDF("l", "mm", "a4");

    const columns = [
      "No.",
      "Project ID",
      "First Name",
      "Last Name",
      "Job Type",
      "Services",
      "Date",
    ];

    const rows = filteredProjects.map((project) => [
      filteredProjects.indexOf(project) + 1,
      project.projectID,
      project.clientFirstName,
      project.clientLastName,
      project.jobType,
      project.jobServices ? project.jobServices.join(", ") : "",
      new Date(project.jobCompletedDate).toLocaleString("en-US", {
        hour12: true,
        minute: "2-digit",
        hour: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    ]);

    const formattedStartDate = startDate
      ? startDate.toLocaleDateString("en-US")
      : "";
    const formattedEndDate = endDate ? endDate.toLocaleDateString("en-US") : "";

    const dateRange =
      formattedStartDate || formattedEndDate
        ? `From ${formattedStartDate} To ${formattedEndDate}`
        : "All Dates";

    doc.setFontSize(12);
    doc.text("Completed Projects Report", 15, 20);
    doc.setFontSize(10);
    doc.text(dateRange, 15, 27);

    doc.autoTable({
      startY: 30,
      head: [columns],
      body: rows,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 5,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [248, 95, 22],
        lineWidth: 0.1,
        lineColor: [220, 220, 220],
      },
      bodyStyles: {
        lineWidth: 0.1,
        lineColor: [220, 220, 220],
      },
    });

    // Save PDF
    doc.save("completed_projects_report.pdf");
  };

  return (
    <>
      <div className="mb-4 flex justify-end gap-2">
        <div
          className="flex cursor-pointer items-center gap-2 rounded-md border border-primary-400 px-3 py-2 text-sm font-bold hover:bg-gray-100"
          onClick={handleDownload}
        >
          <TbDownload className="text-[18px]" />
          Report
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table border-b bg-white text-base">
          <thead>
            <tr className="border-b-2 border-secondary-200 text-base text-primary-500">
              <th className="w-10">No</th>
              <th className="min-w-[60px]">Project ID</th>
              <th className="min-w-[130px]">First Name</th>
              <th className="min-w-[130px]">Last Name</th>
              <th className="min-w-[200px]">Job Type</th>
              <th className="w-full min-w-[200px]">Services</th>
              <th className="min-w-[200px]">Completed Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center capitalize">
                  <span className="loading loading-bars loading-lg"></span>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="text-center capitalize">
                  {error}
                </td>
              </tr>
            ) : paginatedProjects.length > 0 ? (
              paginatedProjects.map((project, index) => (
                <tr
                  key={project.id || index}
                  className="text-sm uppercase hover:bg-secondary-50"
                >
                  <td>{index + 1}</td>
                  <td>{project.projectID}</td>
                  <td>{project.clientFirstName}</td>
                  <td>{project.clientLastName}</td>
                  <td>{project.jobType}</td>
                  <td>
                    {project.jobServices && project.jobServices.join(", ")}
                  </td>
                  <td>
                    {new Date(project.jobCompletedDate).toLocaleString(
                      "en-US",
                      {
                        hour12: true,
                        minute: "2-digit",
                        hour: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      },
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center capitalize">
                  <img
                    src={NoData}
                    alt="No Data"
                    className="mx-auto h-[250px]"
                  />
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-center gap-8">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="cursor-pointer"
        >
          <TbChevronLeft className="text-secondary-500 hover:text-secondary-800" />
        </button>
        <span className="text-sm text-secondary-500">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="cursor-pointer"
        >
          <TbChevronRight className="text-secondary-500 hover:text-secondary-800" />
        </button>
      </div>

      {openModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
          <div className="animate-fade-down rounded-lg bg-white animate-duration-[400ms] animate-ease-out">
            <div className="flex cursor-pointer items-center justify-between rounded-t-lg border-b border-secondary-200 bg-secondary-100 px-4 py-2">
              <Title variant="secondarySemibold" size="md">
                Completed Report
              </Title>
              <div
                className="flex items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
                onClick={() => setOpenModal(false)}
              >
                <button>
                  <TbX />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex w-full flex-col gap-2">
                <label className="text-sm font-semibold">
                  Date Range <span>(Optional)</span>:
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="From Date"
                  dateFormat="MM/dd/yyyy"
                  className="rounded-md border border-gray-300 bg-secondary-50 px-3 py-1 text-sm"
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  placeholderText="To Date"
                  dateFormat="MM/dd/yyyy"
                  className="rounded-md border border-gray-300 bg-secondary-50 px-3 py-1 text-sm"
                />
                {/* Reset button */}
                <button
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
                >
                  Reset
                </button>
                <div className="my-4 h-[1px] bg-primary-500"></div>
                <div
                  className="flex cursor-pointer items-center rounded-full border px-4 py-2 text-sm font-semibold hover:bg-secondary-50"
                  onClick={handleCSVDownload}
                >
                  <TbFileTypeCsv className="mr-2 text-[20px] text-green-500" />
                  Download as CSV
                </div>
                <div
                  className="flex cursor-pointer items-center rounded-full border px-4 py-2 text-sm font-semibold hover:bg-secondary-50"
                  onClick={handlePDFDownload}
                >
                  <TbFileTypePdf className="mr-2 text-[20px] text-red-500" />
                  Download as PDF
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompletedTableReport;
