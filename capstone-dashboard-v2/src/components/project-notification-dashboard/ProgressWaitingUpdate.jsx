import React, { useEffect, useState } from "react";
import { TbClockUp } from "react-icons/tb";
import { useJobAlertProgress } from "../../data/useJobAlertProgress";

const ProgressWaitingUpdate = ({ projects = [] }) => {
  const [waitingUpdate, setWaitingUpdate] = useState(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { alertProjectStartInPast } = useJobAlertProgress(today);

  useEffect(() => {
    const waitingProjects = projects.filter(
      (project) =>
        project.jobStatus === "in progress" &&
        alertProjectStartInPast(project) &&
        project.jobNotificationAlert !== "ongoing project",
    );

    setWaitingUpdate(waitingProjects.length);
  }, [projects, today, alertProjectStartInPast]);

  return (
    <div
      className={`round w-full rounded-sm ${waitingUpdate === 0 ? "border border-secondary-200 text-secondary-300" : "bg-secondary-200 font-bold text-secondary-950"} `}
    >
      <div className="flex h-full items-center px-3 py-1">
        <TbClockUp className="mr-3 text-[20px]" />
        <span>
          {waitingUpdate === 0
            ? "No projects waiting for update."
            : `${waitingUpdate} project${waitingUpdate !== 1 ? "s" : ""} waiting for update.`}
        </span>
      </div>
    </div>
  );
};

export default ProgressWaitingUpdate;
