import React, { useEffect, useState } from "react";
import { TbReportMoney } from "react-icons/tb";

const WaitingQuotationDb = ({ projects = [] }) => {
  const [readyForQuotationCount, setReadyForQuotationCount] = useState(0);

  useEffect(() => {
    const readyForQuotationProjects = projects.filter((project) => {
      return (
        project.jobStatus === "on process" &&
        project.jobNotificationAlert === "ready for quotation"
      );
    });

    setReadyForQuotationCount(readyForQuotationProjects.length);
  }, [projects]);

  return (
    <div
      className={`round w-full rounded-sm ${
        readyForQuotationCount === 0
          ? "border border-secondary-200 text-secondary-300"
          : "bg-secondary-200 font-bold text-secondary-950"
      }`}
    >
      <div className="flex h-full items-center px-3 py-1">
        <TbReportMoney className="mr-3 text-[20px]" />
        <span>
          {readyForQuotationCount === 0
            ? "No projects ready for quotation."
            : `${readyForQuotationCount} project${
                readyForQuotationCount !== 1 ? "s" : ""
              } ready for quotation.`}
        </span>
      </div>
    </div>
  );
};

export default WaitingQuotationDb;
