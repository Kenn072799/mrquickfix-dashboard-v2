import React from "react";
import { TbCalendarUp } from "react-icons/tb";

const startedProject = 1;

const StartedProjectDb = () => {
  return (
    <div className="round rounded-sm border border-blue-600 bg-blue-200 text-blue-600">
      <div className="flex h-full items-center px-3 py-1">
        <TbCalendarUp className="mr-3 text-[26px]" />
        <span>
          {startedProject} project{startedProject !== 1 ? "s" : ""} scheduled
          for today.
        </span>
      </div>
    </div>
  );
};

export default StartedProjectDb;
