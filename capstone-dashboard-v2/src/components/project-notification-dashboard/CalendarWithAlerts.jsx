import React, { useState, useEffect } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Title } from "../props/Title";
import { TbX } from "react-icons/tb";

const localizer = dayjsLocalizer(dayjs);

const CalendarWithAlerts = ({ projects = [] }) => {
  const [myEventsList, setMyEventsList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const filteredProjects = projects.filter(
      (project) =>
        project.jobStatus === "on process" ||
        project.jobStatus === "in progress",
    );

    const events = filteredProjects.map((project) => {
      let start = new Date();
      let end = new Date();

      if (project.jobStatus === "in progress") {
        start = new Date(project.jobStartDate);
        end = new Date(project.jobEndDate);

        if (project.jobExtendedDate) {
          end = new Date(project.jobExtendedDate);
        }

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 58, 59);
      } else if (project.jobStatus === "on process") {
        start = new Date(project.jobInspectionDate);
        end = new Date(start);
        end.setDate(start.getDate() + 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
      }

      return {
        title: `${project.projectID} - ${project.clientFirstName} ${project.clientLastName}`,
        start: start,
        end: end,
        projectID: project.projectID,
        clientFirstName: project.clientFirstName,
        clientLastName: project.clientLastName,
        jobType: project.jobType,
        jobStatus: project.jobStatus,
        jobStartDate: start,
        jobEndDate: end,
        jobInspectionDate: start,
        jobExtendedDate: project.jobExtendedDate,
      };
    });

    setMyEventsList(events);
  }, [projects]);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const formatDate = (date) => {
    return dayjs(date).format("MMMM D, YYYY");
  };

  const getDurationInDays = (start, end) => {
    const duration = end - start;
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    return days;
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = "";
    let color = "";

    if (event.jobStatus === "in progress") {
      backgroundColor = "#fed0aa";
      color = "#ef6c00";
    } else if (event.jobStatus === "on process") {
      backgroundColor = "#90caf9";
      color = "#0d47a1";
    }

    return {
      style: {
        backgroundColor,
        color,
        fontWeight: "bold",
        fontSize: "14px",
        borderRadius: "4px",
      },
    };
  };

  return (
    <>
      {/* Modal to display event details */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50">
          <div className="mx-4 mt-14 w-full max-w-[500px] animate-fade-down rounded-md bg-white animate-duration-[400ms] animate-ease-out">
            <div className="flex flex-col capitalize">
              <div className="flex cursor-pointer items-center justify-between rounded-t-md border-b border-secondary-200 bg-secondary-100 px-4 py-2">
                <Title variant="secondarySemibold" size="lg">
                  Project Details
                </Title>
                <div
                  className="flex items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
                  onClick={closeModal}
                >
                  <button>
                    <TbX />
                  </button>
                </div>
              </div>
              <div className="flex flex-col p-4 text-sm text-secondary-900 md:text-base">
                <span className="flex justify-between text-right hover:bg-secondary-50">
                  <strong className="text-left">Project ID:</strong>{" "}
                  {selectedEvent.projectID}
                </span>
                <span className="flex justify-between text-right hover:bg-secondary-50">
                  <strong className="text-left">Client Name:</strong>{" "}
                  {selectedEvent.clientFirstName} {selectedEvent.clientLastName}
                </span>
                <span className="flex justify-between text-right hover:bg-secondary-50">
                  <strong className="text-left">Job Type:</strong>{" "}
                  {selectedEvent.jobType}
                </span>
                <span className="flex justify-between text-right hover:bg-secondary-50">
                  <strong className="text-left">Status:</strong>{" "}
                  {selectedEvent.jobStatus}
                </span>
                {selectedEvent.jobStatus === "in progress" ? (
                  <>
                    <span className="flex justify-between text-right hover:bg-secondary-50">
                      <strong className="text-left">Start Date:</strong>{" "}
                      {formatDate(selectedEvent.jobStartDate)}
                    </span>
                    {selectedEvent.jobExtendedDate ? (
                      <span className="flex justify-between text-right hover:bg-secondary-50">
                        <strong className="text-left">
                          Extended End Date:
                        </strong>{" "}
                        {formatDate(selectedEvent.jobExtendedDate)}
                      </span>
                    ) : (
                      <span className="flex justify-between text-right hover:bg-secondary-50">
                        <strong className="text-left">End Date:</strong>{" "}
                        {formatDate(selectedEvent.jobEndDate)}
                      </span>
                    )}
                    <span className="flex justify-between text-right hover:bg-secondary-50">
                      <strong className="text-left"> Project Duration: </strong>
                      {getDurationInDays(
                        selectedEvent.jobStartDate,
                        selectedEvent.jobEndDate,
                      )}{" "}
                      days
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex justify-between text-right hover:bg-secondary-50">
                      <strong className="text-left">Inspection Date:</strong>{" "}
                      {formatDate(selectedEvent.jobInspectionDate)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Calendar
        localizer={localizer}
        events={myEventsList}
        startAccessor="start"
        endAccessor="end"
        className="h-[700px] bg-white p-4"
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyleGetter}
      />
    </>
  );
};

export default CalendarWithAlerts;
