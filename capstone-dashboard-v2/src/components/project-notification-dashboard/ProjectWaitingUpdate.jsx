import React, { useEffect, useState } from "react";
import { TbClockUp } from "react-icons/tb";
import { useJobAlerts } from "../../data/useJobAlerts";

const ProjectWaitingUpdate = ({ projects = [] }) => {
  const [waitingUpdateCount, setWaitingUpdateCount] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { alertWaitingUpdate } = useJobAlerts(today);

  useEffect(() => {
    const waitingUpdateProjects = projects.filter((project) => {
      return (
        project.jobStatus === "on process" &&
        alertWaitingUpdate(project) &&
        project.jobNotificationAlert !== "ready for quotation"
      );
    });

    setWaitingUpdateCount(waitingUpdateProjects.length);
  }, [projects, today, alertWaitingUpdate]);

  return (
    <div
      className={`round w-full rounded-sm ${
        waitingUpdateCount === 0
          ? "border border-secondary-200 text-secondary-300"
          : "bg-secondary-200 font-bold text-secondary-950"
      }`}
    >
      <div className="flex h-full items-center px-3 py-1">
        <TbClockUp className="mr-3 text-[20px]" />
        <span>
          {waitingUpdateCount === 0
            ? "No projects waiting for update."
            : `${waitingUpdateCount} project${
                waitingUpdateCount !== 1 ? "s" : ""
              } waiting for update.`}
        </span>
      </div>
    </div>
  );
};

export default ProjectWaitingUpdate;
