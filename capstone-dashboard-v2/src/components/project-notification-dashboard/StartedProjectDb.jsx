import React, { useEffect, useState } from "react";
import { TbCalendarEvent } from "react-icons/tb";
import { useJobAlertProgress } from "../../data/useJobAlertProgress";

const StartedProjectDb = ({ projects = [] }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { alertProjectStartToday } = useJobAlertProgress(today);

  const [startedTodayInProgress, setStartedTodayInProgress] = useState(0);

  useEffect(() => {
    const startedProjectsInProgress = projects.filter((project) => {
      const startDate = new Date(project.jobStartDate);
      startDate.setHours(0, 0, 0, 0);

      return (
        project.jobStatus === "in progress" && alertProjectStartToday(project)
      );
    });

    setStartedTodayInProgress(startedProjectsInProgress.length);
  }, [projects, alertProjectStartToday]);

  return (
    <div
      className={`round w-full rounded-sm ${startedTodayInProgress === 0 ? "border border-secondary-200 text-secondary-300" : "bg-secondary-200 font-bold text-secondary-950"} `}
    >
      <div className="flex h-full items-center px-3 py-1">
        <TbCalendarEvent className="mr-3 text-[20px]" />
        <span>
          {startedTodayInProgress === 0
            ? "No projects started today."
            : `${startedTodayInProgress} project${
                startedTodayInProgress !== 1 ? "s" : ""
              } started today.`}
        </span>
      </div>
    </div>
  );
};

export default StartedProjectDb;
