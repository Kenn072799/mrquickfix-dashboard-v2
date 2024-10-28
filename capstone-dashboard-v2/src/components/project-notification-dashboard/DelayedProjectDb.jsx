import React from "react";
import { TbCalendarExclamation } from "react-icons/tb";

const delayedProject = 1;

const DelayedProjectDb = () => {
  return (
    <div className="round rounded-sm border border-red-600 bg-red-200 text-red-600">
      <div className="flex h-full items-center px-3 py-1">
        <TbCalendarExclamation className="mr-3 text-[26px]" />
        <span>
          {delayedProject} project{delayedProject !== 1 ? "s" : ""}{" "}
          {delayedProject !== 1 ? "are" : "is"} delayed.
        </span>
      </div>
    </div>
  );
};

export default DelayedProjectDb;
