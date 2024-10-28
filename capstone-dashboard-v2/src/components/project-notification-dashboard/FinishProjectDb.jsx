import React from "react";
import { TbCalendarCheck } from "react-icons/tb";

const finishProject = 3;

const FinishProjectDb = () => {
  return (
    <div className="round rounded-sm border border-green-600 bg-green-200 text-green-600">
      <div className="flex h-full items-center px-3 py-1">
        <TbCalendarCheck className="mr-3 text-[26px]" />
        <span>
          {finishProject} project{finishProject !== 1 ? "s" : ""}{" "}
          {finishProject !== 1 ? "are" : "is"} due today.
        </span>
      </div>
    </div>
  );
};

export default FinishProjectDb;
