import React, { useEffect, useState } from "react";
import { TbCalendarPlus } from "react-icons/tb";
import { useJobAlertProgress } from "../../data/useJobAlertProgress";

const ProjectExtended = ({ projects = [] }) => {
  const [extendedProjectCount, setExtendedProjectCount] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { alertProjectExtended } = useJobAlertProgress(today);

  useEffect(() => {
    const extendedProjects = projects.filter(
      (project) =>
        project.jobStatus === "in progress" && alertProjectExtended(project),
    );

    setExtendedProjectCount(extendedProjects.length);
  }, [projects, today, alertProjectExtended]);

  return (
    <div
      className={`round w-full rounded-sm ${extendedProjectCount === 0 ? "border border-secondary-200 text-secondary-300" : "bg-secondary-200 font-bold text-secondary-950"}`}
    >
      <div className="flex h-full items-center px-3 py-1">
        <TbCalendarPlus className="mr-3 text-[20px]" />
        <span>
          {extendedProjectCount === 0
            ? "No extended projects."
            : `${extendedProjectCount} project${
                extendedProjectCount !== 1 ? "s" : ""
              } extended.`}
        </span>
      </div>
    </div>
  );
};

export default ProjectExtended;
