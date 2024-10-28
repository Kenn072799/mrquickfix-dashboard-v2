import React from "react";
import { TbCalendarClock } from "react-icons/tb";

const waitingUpdate = 3;

const ProjectWaitingUpdate = () => {
  return (
    <div className="round rounded-sm border border-yellow-600 bg-yellow-200 text-yellow-600">
      <div className="flex h-full items-center px-3 py-1">
        <TbCalendarClock className="mr-3 text-[26px]" />
        <span>
          {waitingUpdate} project{waitingUpdate !== 1 ? "s" : ""} waiting for
          update.
        </span>
      </div>
    </div>
  );
};

export default ProjectWaitingUpdate;
