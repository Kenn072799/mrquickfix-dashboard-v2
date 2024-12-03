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
  TbSortAscending,
  TbSortDescending,
} from "react-icons/tb";
import { Title } from "../props/Title";
import NoData from "../../assets/undraw_No_data_re_kwbl.png";
import useCapitalize from "../hooks/useCapitalize";

const formatDate = (date) =>
  new Date(date).toLocaleString("en-US", {
    hour12: true,
    minute: "2-digit",
    hour: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const CompletedTableReport = ({ projects, loading, error }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const { capitalizeWords } = useCapitalize();
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const resetTimeToMidnight = (date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  const resetTimeToEndOfDay = (date) => {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortDirection = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? (
        <TbSortAscending className="text-lg" />
      ) : (
        <TbSortDescending className="text-lg" />
      );
    }
    return (
      <TbSortAscending className="text-lg opacity-0 group-hover:opacity-50" />
    );
  };

  const getFilteredProjects = () => {
    const adjustedStartDate = startDate ? resetTimeToMidnight(startDate) : null;
    const adjustedEndDate = endDate ? resetTimeToEndOfDay(endDate) : null;

    const filtered = projects.filter((project) => {
      const completedDate = new Date(project.jobCompletedDate);
      const isInDateRange =
        (!adjustedStartDate || completedDate >= adjustedStartDate) &&
        (!adjustedEndDate || completedDate <= adjustedEndDate);

      const matchesSearchTerm =
        `${project.clientFirstName} ${project.clientLastName} ${project.projectID}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return (
        project.originalStatus === "completed" &&
        isInDateRange &&
        matchesSearchTerm
      );
    });

    return [...filtered].sort((a, b) => {
      if (!sortConfig.key) return 0;

      const aValue =
        sortConfig.key === "name"
          ? `${a.clientFirstName} ${a.clientLastName}`
          : sortConfig.key === "date"
            ? new Date(a.jobCompletedDate)
            : a[sortConfig.key];
      const bValue =
        sortConfig.key === "name"
          ? `${b.clientFirstName} ${b.clientLastName}`
          : sortConfig.key === "date"
            ? new Date(b.jobCompletedDate)
            : b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  };

  const paginatedProjects = getFilteredProjects().slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const totalPages = Math.ceil(getFilteredProjects().length / rowsPerPage);

  // Handle Modal and Download actions
  const handleDownload = () => setOpenModal(true);

  const handleCSVDownload = () => {
    const csvData = paginatedProjects.map((project) => ({
      "Project ID": project.projectID,
      "First Name": project.clientFirstName,
      "Last Name": project.clientLastName,
      "Job Type": project.jobType,
      Services: project.jobServices ? project.jobServices.join(", ") : "",
      Date: formatDate(project.jobCompletedDate),
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
    const rows = getFilteredProjects().map((project, index) => [
      index + 1,
      project.projectID,
      project.clientFirstName,
      project.clientLastName,
      project.jobType,
      project.jobServices ? project.jobServices.join(", ") : "",
      formatDate(project.jobCompletedDate),
    ]);
    const dateRange = `${startDate ? startDate.toLocaleDateString("en-US") : ""} - ${endDate ? endDate.toLocaleDateString("en-US") : "All Dates"}`;
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
    doc.save("completed_projects_report.pdf");
  };

  return (
    <>
      <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center">
          <Title variant="secondarySemibold" size="sm">
            Search:
          </Title>
          <input
            className="mx-2 rounded-full border-secondary-200 bg-secondary-50 px-3 py-1 text-sm outline-none ring-secondary-600 focus:ring-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="name or pid"
          />
        </div>

        <div
          className="flex cursor-pointer select-none items-center gap-2 rounded-md border border-primary-400 px-3 py-2 text-sm font-bold hover:bg-gray-100"
          onClick={handleDownload}
        >
          <TbDownload className="text-[18px]" />
          Report
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full divide-y-2 divide-secondary-100 border-b border-secondary-100 text-sm">
          <thead className="text-left">
            <tr className="border-b-2 border-secondary-200 text-sm text-primary-500">
              <th className="px-4 py-2">No</th>
              <th
                className={`group relative cursor-pointer whitespace-nowrap px-4 py-2 hover:bg-secondary-50 ${
                  sortConfig.key === "projectID" ? "bg-secondary-50" : ""
                }`}
                onClick={() => requestSort("projectID")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>Project ID</span>
                  {getSortDirection("projectID")}
                </div>
              </th>
              <th
                className={`group relative cursor-pointer px-4 py-2 hover:bg-secondary-50 ${
                  sortConfig.key === "name" ? "bg-secondary-50" : ""
                }`}
                onClick={() => requestSort("name")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>Name</span>
                  {getSortDirection("name")}
                </div>
              </th>
              <th
                className={`group relative cursor-pointer px-4 py-2 hover:bg-secondary-50 ${
                  sortConfig.key === "jobType" ? "bg-secondary-50" : ""
                }`}
                onClick={() => requestSort("jobType")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>Job Type</span>
                  {getSortDirection("jobType")}
                </div>
              </th>
              <th
                className={`group relative cursor-pointer px-4 py-2 hover:bg-secondary-50 ${
                  sortConfig.key === "jobServices" ? "bg-secondary-50" : ""
                }`}
                onClick={() => requestSort("jobServices")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>Services</span>
                  {getSortDirection("jobServices")}
                </div>
              </th>
              <th
                className={`group relative cursor-pointer px-4 py-2 text-right hover:bg-secondary-50 ${
                  sortConfig.key === "date" ? "bg-secondary-50" : ""
                }`}
                onClick={() => requestSort("date")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>Completed Date</span>
                  {getSortDirection("date")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="h-[400px] text-center">
                  <span className="loading loading-bars loading-lg bg-primary-500"></span>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="text-center capitalize">
                  {error}
                </td>
              </tr>
            ) : paginatedProjects.length > 0 ? (
              paginatedProjects.map((project, index) => (
                <tr
                  key={project.id || index}
                  className="bg-white text-sm capitalize hover:bg-secondary-50"
                >
                  <td className="max-w-full px-4 py-2">
                    {getFilteredProjects().indexOf(project) + 1}
                  </td>
                  <td className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                    {project.projectID}
                  </td>
                  <td className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                    {capitalizeWords(project.clientFirstName)}{" "}
                    {capitalizeWords(project.clientLastName)}
                  </td>
                  <td className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                    {project.jobType}
                  </td>
                  <td className="max-w-[350px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                    {project.jobServices && project.jobServices.join(", ")}
                  </td>
                  <td className="flex justify-end overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2 text-right">
                    {formatDate(project.jobCompletedDate)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center capitalize">
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

      {/* Modal for Filters and Downloads */}
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
              <div className="flex w-[250px] flex-col gap-2">
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
                  className="w-full rounded-md border border-gray-300 bg-secondary-50 px-3 py-1 text-sm"
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
                  className="w-full rounded-md border border-gray-300 bg-secondary-50 px-3 py-1 text-sm"
                />
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
                  className="flex cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm hover:bg-secondary-50"
                  onClick={handleCSVDownload}
                >
                  <TbFileTypeCsv className="mr-2 text-[20px] text-green-500" />
                  Download as CSV
                </div>
                <div
                  className="flex cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm hover:bg-secondary-50"
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
