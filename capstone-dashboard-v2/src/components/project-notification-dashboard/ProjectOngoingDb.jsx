import React from "react";
import { TbCalendarShare } from "react-icons/tb";

const onGoingProject = 1;
const ProjectOngoingDb = () => {
  return (
    <div className="round border-primary-600 bg-primary-200 text-primary-600 rounded-sm border">
      <div className="flex h-full items-center px-3 py-1">
        <TbCalendarShare className="mr-3 text-[26px]" />
        <span>
          {onGoingProject} project{onGoingProject !== 1 ? "s" : ""}{" "}
          {onGoingProject !== 1 ? "are" : "is"} ongoing.
        </span>
      </div>
    </div>
  );
};

export default ProjectOngoingDb;
