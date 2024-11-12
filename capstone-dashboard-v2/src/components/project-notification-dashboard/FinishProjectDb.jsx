import React, { useEffect, useState } from "react";
import { TbCalendarCheck } from "react-icons/tb";
import { useJobAlertProgress } from "../../data/useJobAlertProgress";

const FinishProjectDb = ({ projects = [] }) => {
  const [projectsFinishToday, setProjectsFinishToday] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { alertProjectFinishToday } = useJobAlertProgress(today);

  useEffect(() => {
    const count = projects.filter(
      (project) =>
        project.jobStatus === "in progress" && alertProjectFinishToday(project),
    );

    setProjectsFinishToday(count.length);
  }, [projects, today, alertProjectFinishToday]);

  return (
    <div
      className={`round w-full rounded-sm ${projectsFinishToday === 0 ? "border border-secondary-200 text-secondary-300" : "bg-secondary-200 font-bold text-secondary-950"}`}
    >
      <div className="flex h-full items-center px-3 py-1">
        <TbCalendarCheck className="mr-3 text-[20px]" />
        <span>
          {projectsFinishToday === 0
            ? "No projects finishing today."
            : `${projectsFinishToday} project${
                projectsFinishToday !== 1 ? "s" : ""
              } finishing today.`}
        </span>
      </div>
    </div>
  );
};

export default FinishProjectDb;
