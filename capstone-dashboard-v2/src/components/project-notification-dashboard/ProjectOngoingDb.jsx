import React, { useEffect, useState } from "react";
import { TbCalendarClock } from "react-icons/tb";

const ProjectOngoingDb = ({ projects = [] }) => {
  const [onGoingProject, setOnGoingProject] = useState(0);

  useEffect(() => {
    const ongoingProjects = projects.filter(
      (project) =>
        project.jobStatus === "in progress" &&
        project.jobNotificationAlert === "ongoing project",
    );

    setOnGoingProject(ongoingProjects.length);
  }, [projects]);

  return (
    <div
      className={`round w-full rounded-sm ${onGoingProject === 0 ? "border border-secondary-200 text-secondary-300" : "bg-secondary-200 font-bold text-secondary-950"} `}
    >
      <div className="flex h-full items-center px-3 py-1">
        <TbCalendarClock className="mr-3 text-[20px]" />
        <span>
          {onGoingProject === 0
            ? "No ongoing projects."
            : `${onGoingProject} project${onGoingProject !== 1 ? "s" : ""} ${
                onGoingProject !== 1 ? "are" : "is"
              } ongoing.`}
        </span>
      </div>
    </div>
  );
};

export default ProjectOngoingDb;
