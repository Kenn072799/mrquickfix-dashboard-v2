import React, { useEffect, useState } from "react";
import { TbClock24 } from "react-icons/tb";
import { useJobAlertProgress } from "../../data/useJobAlertProgress";

const ProjectTomorrow = ({ projects = [] }) => {
  const [projectsStartingTomorrow, setProjectsStartingTomorrow] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { alertProjectStartTomorrow } = useJobAlertProgress(today);

  useEffect(() => {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const filteredProjects = projects.filter((project) => {
      return (
        project.jobStatus === "in progress" &&
        alertProjectStartTomorrow(project)
      );
    });

    setProjectsStartingTomorrow(filteredProjects.length);
  }, [projects, today, alertProjectStartTomorrow]);

  return (
    <div
      className={`round w-full rounded-sm ${projectsStartingTomorrow === 0 ? "border border-secondary-200 text-secondary-300" : "bg-secondary-200 font-bold text-secondary-950"}`}
    >
      <div className="flex h-full items-center px-3 py-1">
        <TbClock24 className="mr-3 text-[20px]" />
        <span>
          {projectsStartingTomorrow === 0
            ? "No projects starting tomorrow."
            : `${projectsStartingTomorrow} project${projectsStartingTomorrow !== 1 ? "s" : ""} ${projectsStartingTomorrow !== 1 ? "are" : "is"} starting tomorrow.`}
        </span>
      </div>
    </div>
  );
};

export default ProjectTomorrow;
