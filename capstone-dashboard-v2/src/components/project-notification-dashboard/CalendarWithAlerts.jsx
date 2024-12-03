import React, { useState, useEffect } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Title } from "../props/Title";
import { TbChevronLeft, TbChevronRight, TbX } from "react-icons/tb";

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
        fontSize: "12px",
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
                      ) === 0 ? (
                        <>1 day </>
                      ) : (
                        <>
                          {getDurationInDays(
                            selectedEvent.jobStartDate,
                            selectedEvent.jobEndDate,
                          )}{" "}
                          days
                        </>
                      )}
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

      <div className="relative w-full overflow-x-auto">
        <Calendar
          localizer={localizer}
          events={myEventsList}
          startAccessor="start"
          endAccessor="end"
          className="min-h-[500px] bg-white p-4 md:h-[700px]"
          onSelectEvent={handleEventClick}
          eventPropGetter={eventStyleGetter}
          views={["month", "week", "day"]}
          defaultView={window.innerWidth < 768 ? "day" : "month"}
          toolbar={true}
          components={{
            toolbar: CustomToolbar,
          }}
        />
      </div>
    </>
  );
};

const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate("PREV");
  };

  const goToNext = () => {
    toolbar.onNavigate("NEXT");
  };

  const goToCurrent = () => {
    toolbar.onNavigate("TODAY");
  };

  const label = () => {
    const date = dayjs(toolbar.date);
    return (
      <span className="text-sm font-semibold md:text-base">
        {date.format("MMMM YYYY")}
      </span>
    );
  };

  return (
    <div className="flex flex-col justify-between gap-2 p-4 md:flex-row items-center">
      <div className="flex items-center gap-2">
        <button type="button" onClick={goToBack}>
          <div className="rounded-lg border p-1 active:bg-secondary-50">
            <TbChevronLeft />
          </div>
        </button>
        <button
          type="button"
          onClick={goToCurrent}
          className="rounded-md px-3 py-1 text-sm hover:bg-secondary-100"
        >
          Today
        </button>
        <button type="button" onClick={goToNext}>
          <div className="rounded-lg border p-1 active:bg-secondary-50">
            <TbChevronRight />
          </div>
        </button>
        <span className="ml-2">{label()}</span>
      </div>

      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => toolbar.onView("month")}
          className={`rounded-md px-3 py-1 ${
            toolbar.view === "month"
              ? "bg-primary-500 text-white"
              : "hover:bg-secondary-100"
          }`}
        >
          Month
        </button>
        <button
          type="button"
          onClick={() => toolbar.onView("week")}
          className={`rounded-md px-3 py-1 ${
            toolbar.view === "week"
              ? "bg-primary-500 text-white"
              : "hover:bg-secondary-100"
          }`}
        >
          Week
        </button>
        <button
          type="button"
          onClick={() => toolbar.onView("day")}
          className={`rounded-md px-3 py-1 ${
            toolbar.view === "day"
              ? "bg-primary-500 text-white"
              : "hover:bg-secondary-100"
          }`}
        >
          Day
        </button>
      </div>
    </div>
  );
};

export default CalendarWithAlerts;
