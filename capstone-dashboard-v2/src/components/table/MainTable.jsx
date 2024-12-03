import React, { useState, useEffect } from "react";
import { Title } from "../props/Title";
import {
  Button,
  Chip,
  Input,
  Textarea,
  Tooltip,
  Typography,
} from "@material-tailwind/react";
import {
  TbEye,
  TbCircleX,
  TbFilePlus,
  TbFlagCheck,
  TbX,
  TbExclamationCircle,
  TbPlayerPlay,
  TbCircleCheck,
  TbChevronRight,
  TbChevronLeft,
  TbArchive,
  TbNote,
  TbCirclePlus,
  TbTrash,
  TbSortAscending,
  TbSortDescending,
} from "react-icons/tb";
import Relax from "../../assets/undraw_A_moment_to_relax_re_v5gv.png";
import { useJobAlerts } from "../../data/useJobAlerts";
import { useJobAlertProgress } from "../../data/useJobAlertProgress";
import useCurrentTime from "../hooks/useCurrentTime";
import useAlert from "../hooks/useAlert";
import useHandleMainTable from "../hooks/useHandleMainTable";
import Swal from "sweetalert2";
import useCapitalize from "../hooks/useCapitalize";

const MainTable = ({ setSelectedJobOrder }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatedProject, setUpdatedProject] = useState(null);
  const [openQuotationModal, setOpenQuotationModal] = useState(false);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [selectedJobOrderForCancel, setSelectedJobOrderForCancel] =
    useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openNote, setOpenNote] = useState(false);
  const [jobOrderForNote, setJobOrderForNote] = useState(null);
  const [viewNote, setViewNote] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const { capitalizeWords } = useCapitalize();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { timeAgo } = useCurrentTime();
  const { alertInspectionTomorrow, alertInspectionToday, alertWaitingUpdate } =
    useJobAlerts(today);

  const {
    alertProjectStartTomorrow,
    alertProjectStartToday,
    alertProjectFinishToday,
    alertProjectDelayed,
    alertProjectStartAndFinishToday,
    alertProjectExtended,
    alertProjectStartInPast,
    alertProjectExtendedFinishToday,
  } = useJobAlertProgress(today);

  const {
    buttonLoading,
    quotationUploaded,
    finishInspectionStatus,
    startProjectStatus,
    cancelReason,
    jobNote,
    loading,
    projects,
    setCancelReason,
    setJobNote,
    handleFinishInspection,
    handleStartProject,
    handleQuotationModal,
    handleCompleteProject,
    handleFileChange,
    handleArchiveProject,
    handleCancelProject,
    handleSubmitNote,
    handleRemoveNote,
  } = useHandleMainTable();

  const { jobNotificationAlertProcess, jobNotificationAlertProgress } =
    useAlert(
      alertInspectionTomorrow,
      alertInspectionToday,
      alertWaitingUpdate,
      finishInspectionStatus,
      alertProjectStartTomorrow,
      alertProjectStartToday,
      alertProjectStartInPast,
      alertProjectStartAndFinishToday,
      alertProjectFinishToday,
      alertProjectDelayed,
      alertProjectExtended,
      alertProjectExtendedFinishToday,
      startProjectStatus,
    );

  const statusColors = {
    "in progress": "orange",
    completed: "green",
    cancelled: "red",
    "on process": "blue",
  };

  const statusOrder = ["on process", "in progress", "completed", "cancelled"];

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const filteredData = projects.filter((jobOrder) => {
    const isNotArchived =
      jobOrder.jobStatus !== "archived" &&
      jobOrder.inquiryStatus !== "pending" &&
      jobOrder.inquiryStatus !== "received";
    const matchesStatus =
      statusFilter === "All" || jobOrder.jobStatus === statusFilter;
    const matchesSearchTerm =
      `${jobOrder.clientFirstName} ${jobOrder.clientLastName} && ${jobOrder.projectID}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return isNotArchived && matchesStatus && matchesSearchTerm;
  });

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) {
      return (
        statusOrder.indexOf(a.jobStatus) - statusOrder.indexOf(b.jobStatus)
      );
    }

    const aValue =
      sortConfig.key === "name"
        ? `${a.clientFirstName} ${a.clientLastName}`
        : a[sortConfig.key];
    const bValue =
      sortConfig.key === "name"
        ? `${b.clientFirstName} ${b.clientLastName}`
        : b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

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

  useEffect(() => {
    setCurrentPage(1);
  }, [entriesToShow]);

  const totalPages = Math.ceil(filteredData.length / entriesToShow);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * entriesToShow,
    currentPage * entriesToShow,
  );

  const handleProceed = () => {
    if (
      !updatedProject.jobQuotation ||
      !updatedProject.jobStartDate ||
      !updatedProject.jobEndDate
    ) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please provide a quotation file, start date, and end date.",
      });
      return;
    }
    handleQuotationModal(updatedProject, setOpenQuotationModal);
  };

  const handleNoteModal = (jobOrder) => {
    setJobOrderForNote(jobOrder);
    setOpenNote(true);
  };

  const handleViewNote = (jobOrder) => {
    setJobOrderForNote(jobOrder);
    setViewNote(true);
  };

  return (
    <div className="border border-secondary-200 bg-white">
      <div className="border-b border-secondary-200 bg-secondary-100 px-4 py-2">
        <Title variant="secondarySemibold" size="lg">
          Job Order List
        </Title>
      </div>
      <div className="p-4">
        <div className="flex flex-col gap-4 pb-4 md:flex-row md:justify-between">
          {/* search bar */}
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

          <div className="flex flex-col gap-4 pb-4 md:flex-row md:justify-between">
            {/* entries */}
            <div className="flex items-center">
              <Title variant="secondarySemibold" size="sm">
                Show:
              </Title>
              <select
                name="entries"
                id="entries"
                className="mx-2 rounded-sm border border-secondary-200 px-3 py-1 text-sm outline-none ring-secondary-600 focus:ring-2 md:text-base"
                value={entriesToShow}
                onChange={(e) => setEntriesToShow(Number(e.target.value))}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            {/* filter by status */}
            <div className="flex items-center">
              <Title variant="secondarySemibold" size="sm">
                Status:
              </Title>
              <select
                name="statusFilter"
                id="statusFilter"
                className="mx-2 rounded-sm border border-secondary-200 px-3 py-1 text-sm outline-none ring-secondary-600 focus:ring-2 md:text-base"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="All">All</option>
                <option value="on process">On process</option>
                <option value="in progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* table */}
        <div className="overflow-auto bg-white">
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
                  className={`group relative cursor-pointer whitespace-nowrap px-4 py-2 hover:bg-secondary-50 ${
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
                    sortConfig.key === "jobStatus" ? "bg-secondary-50" : ""
                  }`}
                  onClick={() => requestSort("jobStatus")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>Status</span>
                    {getSortDirection("jobStatus")}
                  </div>
                </th>
                <th className="px-4 py-2">Alert</th>
                <th className="px-4 py-2 text-right">Note</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan="8" className="h-[400px] text-center">
                    <span className="loading loading-bars loading-lg bg-primary-500"></span>
                  </td>
                </tr>
              </tbody>
            ) : paginatedData.length > 0 ? (
              <tbody className="divide-y divide-secondary-100">
                {paginatedData.map((jobOrder, index) => (
                  <tr
                    key={jobOrder.id || index}
                    className="bg-white text-sm capitalize hover:bg-secondary-50"
                  >
                    <td className="w-[10px] px-4 py-2">
                      {(currentPage - 1) * entriesToShow + (index + 1)}
                    </td>
                    <td className="w-[130px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                      {jobOrder.projectID}
                    </td>
                    <td className="w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                      {capitalizeWords(jobOrder.clientFirstName)}{" "}
                      {capitalizeWords(jobOrder.clientLastName)}
                    </td>
                    <td className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                      {jobOrder.jobType}
                    </td>
                    <td className="w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                      <div className="w-max">
                        <Chip
                          variant="ghost"
                          color={statusColors[jobOrder.jobStatus]}
                          value={jobOrder.jobStatus}
                        />
                      </div>
                    </td>
                    <td className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                      {/* Job Status Alerts */}
                      {jobOrder.jobStatus === "on process" ? (
                        jobNotificationAlertProcess
                          .filter(
                            (alert) =>
                              jobOrder.jobNotificationAlert !==
                                "ready for quotation" ||
                              alert.message === "ready for quotation",
                          )
                          .map((alert, alertIndex) => {
                            const IconComponent = alert.icon;
                            return (
                              (alert.condition(jobOrder) ||
                                jobOrder.jobNotificationAlert ===
                                  alert.message) && (
                                <div className="flex" key={alertIndex}>
                                  <Chip
                                    variant="ghost"
                                    color="gray"
                                    value={
                                      <Typography
                                        variant="small"
                                        className="!flex !items-center !text-sm font-bold capitalize leading-none"
                                      >
                                        <IconComponent className="mr-2 inline text-xl" />
                                        {alert.message}
                                      </Typography>
                                    }
                                  />
                                </div>
                              )
                            );
                          })
                      ) : jobOrder.jobStatus === "in progress" ? (
                        <div className="flex gap-4">
                          {jobNotificationAlertProgress.map(
                            (alert, alertIndex) => {
                              const IconComponent = alert.icon;
                              return (
                                (alert.condition(jobOrder) ||
                                  jobOrder.jobNotificationAlert ===
                                    alert.message) && (
                                  <div className="flex" key={alertIndex}>
                                    <Chip
                                      variant="ghost"
                                      color="gray"
                                      value={
                                        <Typography
                                          variant="small"
                                          className="!flex !items-center !text-sm font-bold capitalize leading-none"
                                        >
                                          <IconComponent className="mr-2 inline text-xl" />
                                          {alert.message}
                                        </Typography>
                                      }
                                    />
                                  </div>
                                )
                              );
                            },
                          )}
                        </div>
                      ) : null}
                    </td>
                    <td className="group max-w-full px-4 py-2 text-right">
                      {/* if the note have a data then show the note otherwise show the add button */}
                      {jobOrder.jobNote ? (
                        <Tooltip
                          content="View Note"
                          className="!bg-opacity-60"
                          placement="left"
                          animate={{
                            mount: { scale: 1, y: 0 },
                            unmount: { scale: 0, y: 25 },
                          }}
                        >
                          <Button
                            className="!bg-amber-500 !p-1"
                            onClick={() => handleViewNote(jobOrder)}
                          >
                            <TbNote className="text-[20px]" />
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip
                          content="Add Note"
                          className="!bg-opacity-60"
                          placement="left"
                          animate={{
                            mount: { scale: 1, y: 0 },
                            unmount: { scale: 0, y: 25 },
                          }}
                        >
                          <Button
                            variant="text"
                            className="!p-1 !text-red-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            onClick={() => handleNoteModal(jobOrder)}
                          >
                            <TbCirclePlus className="text-[20px]" />
                          </Button>
                        </Tooltip>
                      )}
                    </td>
                    <td className="flex justify-end gap-3 px-4 py-2 text-right">
                      {/* Actions based on job status */}
                      {jobOrder.jobStatus === "completed" ||
                      jobOrder.jobStatus === "cancelled" ? (
                        <Tooltip
                          content="Archive"
                          className="!bg-opacity-60"
                          placement="left"
                          animate={{
                            mount: { scale: 1, y: 0 },
                            unmount: { scale: 0, y: 25 },
                          }}
                        >
                          <Button
                            className="!bg-gray-500 !p-1"
                            onClick={() => handleArchiveProject(jobOrder)}
                          >
                            <TbArchive className="text-[20px]" />
                          </Button>
                        </Tooltip>
                      ) : null}
                      {jobOrder.jobStatus === "on process" ? (
                        jobOrder.jobNotificationAlert ===
                        "ready for quotation" ? (
                          <Tooltip
                            content="Add Quotation"
                            className="!bg-opacity-60"
                            placement="left"
                            animate={{
                              mount: { scale: 1, y: 0 },
                              unmount: { scale: 0, y: 25 },
                            }}
                          >
                            <Button
                              className="!bg-green-500 !p-1"
                              onClick={() => {
                                setUpdatedProject(jobOrder);
                                setOpenQuotationModal(true);
                              }}
                            >
                              <TbFilePlus className="text-[20px]" />
                            </Button>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            content="Finish Inspection"
                            className="!bg-opacity-60"
                            placement="left"
                            animate={{
                              mount: { scale: 1, y: 0 },
                              unmount: { scale: 0, y: 25 },
                            }}
                          >
                            <Button
                              className="!bg-red-500 !p-1"
                              onClick={() => handleFinishInspection(jobOrder)}
                            >
                              <TbFlagCheck className="text-[20px]" />
                            </Button>
                          </Tooltip>
                        )
                      ) : jobOrder.jobStatus === "in progress" ? (
                        jobOrder.jobNotificationAlert === "ongoing project" ? (
                          <Tooltip
                            content="Complete Project"
                            className="!bg-opacity-60"
                            placement="left"
                            animate={{
                              mount: { scale: 1, y: 0 },
                              unmount: { scale: 0, y: 25 },
                            }}
                          >
                            <Button
                              className="!bg-green-500 !p-1"
                              onClick={() => handleCompleteProject(jobOrder)}
                            >
                              <TbCircleCheck className="text-[20px]" />
                            </Button>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            content="Start Project"
                            className="!bg-opacity-60"
                            placement="left"
                            animate={{
                              mount: { scale: 1, y: 0 },
                              unmount: { scale: 0, y: 25 },
                            }}
                          >
                            <Button
                              className="!bg-orange-500 !p-1"
                              onClick={() => handleStartProject(jobOrder)}
                            >
                              <TbPlayerPlay className="text-[20px]" />
                            </Button>
                          </Tooltip>
                        )
                      ) : null}
                      <Tooltip
                        content="View Details"
                        className="!bg-opacity-60"
                        placement="left"
                        animate={{
                          mount: { scale: 1, y: 0 },
                          unmount: { scale: 0, y: 25 },
                        }}
                      >
                        <Button
                          className="!bg-blue-500 !p-1"
                          onClick={() => setSelectedJobOrder(jobOrder)}
                        >
                          <TbEye className="text-[20px]" />
                        </Button>
                      </Tooltip>
                      {jobOrder.jobStatus === "cancelled" ||
                      jobOrder.jobStatus === "completed" ? null : (
                        <Tooltip
                          content="Cancel Project"
                          className="!bg-opacity-60"
                          placement="left"
                          animate={{
                            mount: { scale: 1, y: 0 },
                            unmount: { scale: 0, y: 25 },
                          }}
                        >
                          <Button
                            className="!bg-red-500 !p-1"
                            onClick={() => {
                              setSelectedJobOrderForCancel(jobOrder);
                              setOpenCancelModal(true);
                            }}
                          >
                            <TbCircleX className="text-[20px]" />
                          </Button>
                        </Tooltip>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan="8" className="text-center capitalize">
                    <img
                      src={Relax}
                      alt="Relax"
                      className="mx-auto h-[250px]"
                    />
                    A moment to relax
                  </td>
                </tr>
              </tbody>
            )}
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
      </div>

      {/* Quotation Modal */}
      {openQuotationModal && (
        <>
          <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20 px-4">
            <div className="w-full animate-fade-down animate-duration-[400ms] animate-ease-out">
              <div className="mx-auto w-full max-w-[500px]">
                <div className="flex items-center justify-between rounded-t-md border border-b-0 border-secondary-300 bg-secondary-100 px-4 py-2">
                  <Title>Add Quotation</Title>
                  <div
                    className="flex items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
                    onClick={() => setOpenQuotationModal(false)}
                  >
                    <button>
                      <TbX />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-4 rounded-b-md border border-secondary-300 bg-white p-4">
                  <Title variant="secondaryBold" size="sm">
                    Upload and specify the timeline for your project
                  </Title>
                  {/* Upload Quotation File */}
                  <Input
                    type="file"
                    label="Upload Quotation"
                    className="!py-2"
                    onChange={(e) => handleFileChange(e, setUpdatedProject)}
                  />
                  {/* Start and End Date */}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      label="Start Date"
                      type="date"
                      onChange={(e) =>
                        setUpdatedProject((prev) => ({
                          ...prev,
                          jobStartDate: e.target.value,
                        }))
                      }
                    />
                    <Input
                      label="End Date"
                      type="date"
                      onChange={(e) =>
                        setUpdatedProject((prev) => ({
                          ...prev,
                          jobEndDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    onClick={handleProceed}
                    disabled={buttonLoading}
                    className="bg-primary-500"
                  >
                    {buttonLoading ? (
                      <span className="loading loading-dots loading-sm h-1 py-2"></span>
                    ) : (
                      <>Proceed to in progress</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Cancel Modal */}
      {openCancelModal && selectedJobOrderForCancel && (
        <>
          <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20 px-4">
            <div className="w-full animate-fade-down animate-duration-[400ms] animate-ease-out">
              <div className="mx-auto w-full max-w-[500px]">
                <div className="flex items-center justify-between rounded-t-md border border-b-0 border-secondary-300 bg-secondary-100 px-4 py-2">
                  <Title>Cancel Project</Title>
                  <div
                    className="flex cursor-pointer items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
                    onClick={() =>
                      setCancelReason("") & setOpenCancelModal(false)
                    }
                  >
                    <button>
                      <TbX />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 rounded-b-md border border-secondary-300 bg-white p-4">
                  <div className="rounded-lg border border-red-500 bg-red-50 p-1">
                    <span className="flex items-center text-xs">
                      <TbExclamationCircle className="mr-1 text-red-500" />
                      <span className="mr-1 font-bold">WARNING!</span>Once it
                      has been cancelled, you can't undo it.
                    </span>
                  </div>
                  <div className="flex">
                    <span className="pr-1 font-semibold"> Client name:</span>
                    <div className="uppercase">
                      {selectedJobOrderForCancel.clientFirstName}{" "}
                      {selectedJobOrderForCancel.clientLastName}
                    </div>
                  </div>
                  <div className="flex">
                    <span className="pr-1 font-semibold">Current status:</span>
                    <div className="uppercase">
                      {selectedJobOrderForCancel.jobStatus}
                    </div>
                  </div>
                  <Textarea
                    label="Reason for cancellation"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <Button
                    onClick={() =>
                      handleCancelProject(
                        selectedJobOrderForCancel,
                        setOpenCancelModal,
                      )
                    }
                    disabled={buttonLoading}
                    className="!bg-red-500"
                  >
                    {buttonLoading ? (
                      <span className="loading loading-dots loading-sm h-1 py-2"></span>
                    ) : (
                      <>Cancel Project</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {openNote && jobOrderForNote && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20 px-4">
          <div className="w-full animate-fade-down animate-duration-[400ms] animate-ease-out">
            <div className="mx-auto w-full max-w-[500px]">
              <div className="flex items-center justify-between rounded-t-md border border-b-0 border-secondary-300 bg-secondary-100 px-4 py-2">
                <Title>Create a Note</Title>
                <div
                  className="flex cursor-pointer items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
                  onClick={() => setOpenNote(false) || setJobNote("")}
                >
                  <button>
                    <TbX />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-b-md border border-secondary-300 bg-white p-4">
                <span className="text-sm font-bold">
                  For project id: {jobOrderForNote.projectID}
                </span>
                <Textarea
                  variant="static"
                  placeholder="Write your note"
                  value={jobNote}
                  onChange={(e) => setJobNote(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <div className="whitespace-nowrap">
                    <Button
                      variant="text"
                      onClick={() => setJobNote("")}
                      className="w-full text-red-500 shadow-none hover:shadow-none"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="whitespace-nowrap">
                    <Button
                      onClick={() =>
                        handleSubmitNote(
                          jobOrderForNote._id,
                          jobOrderForNote,
                          setOpenNote,
                        )
                      }
                      className="!bg-gray-300 text-black shadow-none hover:shadow-none"
                    >
                      Add Note
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewNote && jobOrderForNote && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20 px-4">
          <div className="w-full animate-fade-down animate-duration-[400ms] animate-ease-out">
            <div className="mx-auto w-full max-w-[500px]">
              <div className="flex items-center justify-between rounded-t-md border border-b-0 border-secondary-300 bg-secondary-100 px-4 py-2">
                <Title>Note</Title>
                <div
                  className="flex cursor-pointer items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
                  onClick={() => setViewNote(false)}
                >
                  <button>
                    <TbX />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-b-md border border-secondary-300 bg-white p-4">
                <div className="flex flex-col gap-1">
                  {jobOrderForNote.jobNote && (
                    <div className="flex flex-col gap-5 rounded-sm border border-secondary-300 bg-secondary-50 p-2">
                      <div className="flex items-center gap-2">
                        <span>{jobOrderForNote.jobNote}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-secondary-400">
                    <span className="text-xs">
                      {jobOrderForNote.updatedNote ? (
                        <>
                          {jobOrderForNote.updatedNote.firstName}{" "}
                          {jobOrderForNote.updatedNote.lastName}
                        </>
                      ) : (
                        <>
                          {jobOrderForNote.createdNote.firstName}{" "}
                          {jobOrderForNote.createdNote.lastName}
                        </>
                      )}
                    </span>
                    <span className="text-xs">
                      •{" "}
                      {jobOrderForNote.updatedNote ? (
                        <>{timeAgo(jobOrderForNote.updatedNoteDate)}</>
                      ) : (
                        <>{timeAgo(jobOrderForNote.createdNoteDate)}</>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Tooltip
                    content="Remove Note"
                    className="!bg-opacity-60"
                    placement="top"
                    animate={{
                      mount: { scale: 1, y: 0 },
                      unmount: { scale: 0, y: 25 },
                    }}
                  >
                    <Button
                      className="flex items-center gap-2 bg-red-500 shadow-none hover:shadow-none"
                      size="sm"
                      variant="filled"
                      onClick={() =>
                        handleRemoveNote(
                          jobOrderForNote._id,
                          jobOrderForNote,
                          setViewNote,
                        )
                      }
                    >
                      <TbTrash className="text-[16px]" />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    content="New Note"
                    className="!bg-opacity-60"
                    placement="top"
                    animate={{
                      mount: { scale: 1, y: 0 },
                      unmount: { scale: 0, y: 25 },
                    }}
                  >
                    <Button
                      className="flex items-center gap-2 bg-blue-500 shadow-none hover:shadow-none"
                      size="sm"
                      variant="filled"
                      onClick={() => setOpenNote(true) || setViewNote(false)}
                    >
                      <TbCirclePlus className="text-[16px]" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainTable;
