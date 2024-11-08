import React, { useEffect, useState } from "react";
import { Title } from "../props/Title";
import {
  Button,
  Chip,
  Input,
  Tooltip,
  Typography,
} from "@material-tailwind/react";
import Swal from "sweetalert2";
import { useJobOrderData } from "../../data/JobOrderData";
import {
  TbEye,
  TbCircleX,
  TbCalendarSearch,
  TbClockUp,
  TbHomeSearch,
  TbFilePlus,
  TbReportMoney,
  TbFlagCheck,
  TbX,
  TbCalendarEvent,
  TbCalendarBolt,
  TbCalendarCheck,
  TbExclamationCircle,
  TbCalendarPlus,
  TbClock24,
  TbPlayerPlay,
  TbCircleCheck,
  TbCalendarClock,
} from "react-icons/tb";
import Relax from "../../assets/undraw_A_moment_to_relax_re_v5gv.png";
import { useJobAlerts } from "../../data/useJobAlerts";
import { useJobAlertProgress } from "../../data/useJobAlertProgress";

const MainTable = ({ setSelectedJobOrder }) => {
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [statusFilter, setStatusFilter] = useState("All");
  const { fetchProjects, projects, updateJobOrder, alertJobOrder } =
    useJobOrderData();
  const [updatedProject, setUpdatedProject] = useState(null);
  const [openQuotationModal, setOpenQuotationModal] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quotationUploaded, setQuotationUploaded] = useState(false);
  const [finishInspectionStatus, setFinishInspectionStatus] = useState({});
  const [startProjectStatus, setStartProjectStatus] = useState({});

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;

    return function (...args) {
      const context = this;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(
          () => {
            if (Date.now() - lastRan >= limit) {
              func.apply(context, args);
              lastRan = Date.now();
            }
          },
          limit - (Date.now() - lastRan),
        );
      }
    };
  };

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

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await fetchProjects();
        const statusFromDatabase = {};
        projects.forEach((jobOrder) => {
          if (jobOrder.jobNotificationAlert === "ongoing project") {
            statusFromDatabase[jobOrder._id] = true;
          }
        });
        setStartProjectStatus(statusFromDatabase);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    const throttledFetchProjects = throttle(async () => {
      setLoading(true);
      try {
        await fetchProjects();
      } catch (error) {
        console.error("Error fetching projects during interval:", error);
      } finally {
        setLoading(false);
      }
    }, 120000);

    const intervalId = setInterval(throttledFetchProjects, 10000);

    return () => clearInterval(intervalId);
  }, [fetchProjects]);

  const jobNotificationAlertProcess = [
    {
      message: "inspection tomorrow",
      icon: TbCalendarSearch,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "on process" &&
        alertInspectionTomorrow(jobOrder),
    },
    {
      message: "up for inspection",
      icon: TbHomeSearch,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "on process" && alertInspectionToday(jobOrder),
    },
    {
      message: "waiting for update",
      icon: TbClockUp,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "on process" && alertWaitingUpdate(jobOrder),
    },
    {
      message: "ready for quotation",
      icon: TbReportMoney,
      condition: (jobOrder) => finishInspectionStatus[jobOrder._id] === true,
    },
  ];

  const jobNotificationAlertProgress = [
    {
      message: "Project starts tomorrow",
      icon: TbClock24,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" &&
        alertProjectStartTomorrow(jobOrder),
    },
    {
      message: "Project starts today",
      icon: TbCalendarEvent,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" &&
        alertProjectStartToday(jobOrder),
    },
    {
      message: "Waiting for update",
      icon: TbClockUp,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" &&
        alertProjectStartInPast(jobOrder) &&
        !startProjectStatus[jobOrder._id],
    },
    {
      message: "Project starts and finishes today",
      icon: TbCalendarBolt,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" &&
        alertProjectStartAndFinishToday(jobOrder),
    },
    {
      message: "Project finishes today",
      icon: TbCalendarCheck,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" &&
        alertProjectFinishToday(jobOrder),
    },
    {
      message: "Project is delayed",
      icon: TbExclamationCircle,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" && alertProjectDelayed(jobOrder),
    },
    {
      message: "Project has been extended",
      icon: TbCalendarPlus,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" && alertProjectExtended(jobOrder),
    },
    {
      message: "Extended project finishes today",
      icon: TbCalendarCheck,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" &&
        alertProjectExtendedFinishToday(jobOrder),
    },
    {
      message: "Ongoing project",
      icon: TbCalendarClock,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" &&
        startProjectStatus[jobOrder._id],
    },
  ];

  const handleFinishInspection = async (jobOrder) => {
    try {
      const result = await Swal.fire({
        title: "Do you want to finish inspection?",
        showCancelButton: true,
        confirmButtonText: "Yes, Finish",
        icon: "question",
      });

      if (result.isConfirmed) {
        setFinishInspectionStatus((prevStatus) => ({
          ...prevStatus,
          jobNotificationAlert: "ready for quotation",
          [jobOrder._id]: true,
        }));

        const updateResult = await alertJobOrder(jobOrder._id, {
          jobNotificationAlert: "ready for quotation",
        });

        if (updateResult.success) {
          Swal.fire(
            "Inspection Finished",
            "You can now add a quotation.",
            "success",
          );
        } else {
          console.error("Failed to update job order:", updateResult.message);
          Swal.fire("Error", "Failed to update job order.", "error");
          setFinishInspectionStatus((prevStatus) => ({
            ...prevStatus,
            jobNotificationAlert: "",
            [jobOrder._id]: false,
          }));
        }
      }
    } catch (error) {
      console.error("Error updating job order:", error);
      Swal.fire("Error", "Failed to update job order.", "error");
      setFinishInspectionStatus((prevStatus) => ({
        ...prevStatus,
        jobNotificationAlert: "",
        [jobOrder._id]: false,
      }));
    }
  };

  const handleStartProject = async (jobOrder) => {
    try {
      const result = await Swal.fire({
        title: "Do you want to start this project?",
        showCancelButton: true,
        confirmButtonText: "Yes, Start",
        icon: "question",
      });

      if (result.isConfirmed) {
        setStartProjectStatus((prevStatus) => ({
          ...prevStatus,
          [jobOrder._id]: true,
        }));

        const updateResult = await alertJobOrder(jobOrder._id, {
          jobNotificationAlert: "ongoing project",
        });

        if (updateResult.success) {
          Swal.fire(
            "Project Started",
            "Stay up to date with project alert.",
            "success",
          );
        } else {
          setStartProjectStatus((prevStatus) => ({
            ...prevStatus,
            [jobOrder._id]: false,
          }));
          Swal.fire("Error", "Failed to update job order.", "error");
        }
      }
    } catch (error) {
      setStartProjectStatus((prevStatus) => ({
        ...prevStatus,
        [jobOrder._id]: false,
      }));
      Swal.fire("Error", "Failed to update job order.", "error");
    }
  };

  const statusColors = {
    "in progress": "orange",
    completed: "green",
    cancelled: "red",
    "on process": "blue",
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const filteredData = projects.filter(
    (jobOrder) => statusFilter === "All" || jobOrder.jobStatus === statusFilter,
  );

  const handleQuotationModal = async () => {
    const result = await Swal.fire({
      title: "Do you want to save the changes?",
      showCancelButton: true,
      confirmButtonText: "Save",
    });

    if (result.isConfirmed) {
      try {
        setButtonLoading(true);

        const userID = localStorage.getItem("userID");

        if (!userID) {
          setButtonLoading(false);
          Swal.fire(
            "Error",
            "User ID is required to update the job order.",
            "error",
          );
          return;
        }

        const updatedJob = {
          ...updatedProject,
          jobStatus: "in progress",
          updatedBy: userID,
        };

        const { success, message } = await updateJobOrder(
          updatedProject._id,
          updatedJob,
        );

        setButtonLoading(false);

        if (!success) {
          Swal.fire("Oops...", message, "error");
        } else {
          Swal.fire("Saved!", "Job order updated successfully!", "success");
          setOpenQuotationModal(false);
        }
      } catch (error) {
        setButtonLoading(false);
        Swal.fire("Error", "Failed to update job order.", "error");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setQuotationUploaded(!!file);
    setUpdatedProject((prev) => ({
      ...prev,
      jobQuotation: file ? file.name : "",
    }));
  };

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
    handleQuotationModal();
  };

  return (
    <div className="border border-secondary-200 bg-white">
      <div className="border-b border-secondary-200 bg-secondary-100 px-4 py-2">
        <Title variant="secondarySemibold" size="lg">
          Job Order List
        </Title>
      </div>
      <div className="p-4">
        <div className="flex justify-between pb-4">
          {/* entries */}
          <div className="flex items-center">
            <Title variant="secondaryNormal" size="md">
              Show
            </Title>
            <select
              name="entries"
              id="entries"
              className="mx-2 rounded-sm border border-secondary-200 px-3 py-1 text-base outline-none ring-secondary-600 focus:ring-2"
              value={entriesToShow}
              onChange={(e) => setEntriesToShow(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <Title variant="secondaryNormal" size="md">
              entries
            </Title>
          </div>

          {/* search bar */}
          <div className="flex items-center">
            <Title variant="secondaryNormal" size="md">
              Search:
            </Title>
            <input className="mx-2 rounded-sm border border-secondary-200 px-3 py-1 text-base outline-none ring-secondary-600 focus:ring-2" />
          </div>
        </div>

        {/* filter by status */}
        <div className="flex items-center pb-4">
          <Title variant="secondaryNormal" size="md">
            Status:
          </Title>
          <select
            name="statusFilter"
            id="statusFilter"
            className="mx-2 rounded-sm border border-secondary-200 px-3 py-1 text-base outline-none ring-secondary-600 focus:ring-2"
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

        {/* table */}
        <div className="overflow-x-auto">
          <table className="table border border-secondary-200 bg-white text-base">
            <thead>
              <tr className="border-b-2 border-secondary-200 text-base text-primary-500">
                <th className="w-10">No</th>
                <th className="min-w-[150px]">First Name</th>
                <th className="min-w-[150px]">Last Name</th>
                <th className="min-w-[200px]">Job Type</th>
                <th className="min-w-[150px]">Status</th>
                <th className="w-full">Alert</th>
                <th className="min-w-[150px]">Action</th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan="7" className="h-[400px] text-center">
                    <span className="loading loading-bars loading-lg"></span>
                  </td>
                </tr>
              </tbody>
            ) : projects.length > 0 ? (
              <tbody>
                {filteredData.slice(0, entriesToShow).map((jobOrder, index) => (
                  <tr
                    key={jobOrder.id || index}
                    className="hover:bg-secondary-50"
                  >
                    <td>{index + 1}</td>
                    <td>{jobOrder.clientFirstName}</td>
                    <td>{jobOrder.clientLastName}</td>
                    <td>{jobOrder.jobType}</td>
                    <td>
                      <div className="flex font-semibold">
                        <Chip
                          variant="ghost"
                          color={statusColors[jobOrder.jobStatus]}
                          value={
                            <Typography
                              variant="small"
                              className="font-bold capitalize leading-none"
                            >
                              {jobOrder.jobStatus}
                            </Typography>
                          }
                        />
                      </div>
                    </td>
                    <td>
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
                    <td className="flex items-center justify-end gap-3">
                      {/* Actions based on job status */}
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
                            content="Complete project"
                            className="!bg-opacity-60"
                            placement="left"
                            animate={{
                              mount: { scale: 1, y: 0 },
                              unmount: { scale: 0, y: 25 },
                            }}
                          >
                            <Button className="!bg-green-500 !p-1">
                              <TbCircleCheck className="text-[20px]" />
                            </Button>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            content="Start project"
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
                        content="View details"
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
                      <Tooltip
                        content="Cancel project"
                        className="!bg-opacity-60"
                        placement="left"
                        animate={{
                          mount: { scale: 1, y: 0 },
                          unmount: { scale: 0, y: 25 },
                        }}
                      >
                        <Button className="!bg-red-500 !p-1">
                          <TbCircleX className="text-[20px]" />
                        </Button>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan="7" className="text-center capitalize">
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
      </div>
      {openQuotationModal && (
        <>
          <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20">
            <div className="animate-fade-down animate-duration-[400ms] animate-ease-out">
              <div className="max-w-[500px]">
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
                    onChange={handleFileChange}
                  />
                  {/* Start and End Date */}
                  <div className="flex gap-2">
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
                  <Button onClick={handleProceed} disabled={buttonLoading}>
                    {buttonLoading ? (
                      <span className="loading loading-dots loading-md"></span>
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
    </div>
  );
};

export default MainTable;
