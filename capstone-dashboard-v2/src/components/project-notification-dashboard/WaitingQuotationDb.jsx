import React from "react";
import { TbCalendarDollar } from "react-icons/tb";

const waitingQuatation = 2;

const WaitingQuotationDb = () => {
  return (
    <div className="round rounded-sm border border-green-600 bg-green-200 text-green-600">
      <div className="flex h-full items-center px-3 py-1">
        <TbCalendarDollar className="mr-3 text-[26px]" />
        <span>
          {waitingQuatation} project{waitingQuatation !== 1 ? "s" : ""} waiting
          for quotation.
        </span>
      </div>
    </div>
  );
};

export default WaitingQuotationDb;
