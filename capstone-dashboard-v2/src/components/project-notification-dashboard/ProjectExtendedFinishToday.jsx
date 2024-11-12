import React, { useEffect, useState } from "react";
import { TbCalendarCheck } from "react-icons/tb";
import { useJobAlertProgress } from "../../data/useJobAlertProgress";

const ProjectExtendedFinishToday = ({ projects = [] }) => {
  const [extendedFinishTodayCount, setExtendedFinishTodayCount] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { alertProjectExtendedFinishToday } = useJobAlertProgress(today);

  useEffect(() => {
    const extendedFinishTodayProjects = projects.filter(
      (project) =>
        project.jobStatus === "in progress" &&
        alertProjectExtendedFinishToday(project),
    );

    setExtendedFinishTodayCount(extendedFinishTodayProjects.length);
  }, [projects, today, alertProjectExtendedFinishToday]);

  return (
    <div
      className={`round w-full rounded-sm ${extendedFinishTodayCount === 0 ? "border border-secondary-200 text-secondary-300" : "bg-secondary-200 font-bold text-secondary-950"}`}
    >
      <div className="flex h-full items-center px-3 py-1">
        <TbCalendarCheck className="mr-3 text-[20px]" />
        <span>
          {extendedFinishTodayCount === 0
            ? "No extended projects finishing today."
            : `${extendedFinishTodayCount} extended project${
                extendedFinishTodayCount !== 1 ? "s" : ""
              } finishing today.`}
        </span>
      </div>
    </div>
  );
};

export default ProjectExtendedFinishToday;
