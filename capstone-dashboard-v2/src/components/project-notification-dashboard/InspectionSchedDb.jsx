import React from "react";
import { TbCalendarSearch } from "react-icons/tb";

const inspectionSched = 2;

const InspectionSchedDb = () => {
  return (
    <div className="round rounded-sm border border-blue-600 bg-blue-200 text-blue-600">
      <div className="flex h-full items-center px-3 py-1">
        <TbCalendarSearch className="mr-3 text-[26px]" />
        <span>
          {inspectionSched} inspection{inspectionSched !== 1 ? "s" : ""}{" "}
          scheduled for today.
        </span>
      </div>
    </div>
  );
};

export default InspectionSchedDb;
