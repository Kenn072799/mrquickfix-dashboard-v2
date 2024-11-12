import React, { useEffect, useState } from "react";
import { TbCalendarBolt } from "react-icons/tb";
import { useJobAlertProgress } from "../../data/useJobAlertProgress";

const StartAndFinishToday = ({ projects = [] }) => {
  const [projectsStartAndFinishToday, setProjectsStartAndFinishToday] =
    useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { alertProjectStartAndFinishToday } = useJobAlertProgress(today);

  useEffect(() => {
    const count = projects.filter(
      (project) =>
        project.jobStatus === "in progress" &&
        alertProjectStartAndFinishToday(project),
    );

    setProjectsStartAndFinishToday(count.length);
  }, [projects, today, alertProjectStartAndFinishToday]);

  return (
    <div
      className={`round w-full rounded-sm ${projectsStartAndFinishToday === 0 ? "border border-secondary-200 text-secondary-300" : "bg-secondary-200 font-bold text-secondary-950"}`}
    >
      <div className="flex h-full items-center px-3 py-1">
        <TbCalendarBolt className="mr-3 text-[20px]" />
        <span>
          {projectsStartAndFinishToday === 0
            ? "No projects starting and finishing today."
            : `${projectsStartAndFinishToday} project${
                projectsStartAndFinishToday !== 1 ? "s" : ""
              } starting and finishing today.`}
        </span>
      </div>
    </div>
  );
};

export default StartAndFinishToday;
