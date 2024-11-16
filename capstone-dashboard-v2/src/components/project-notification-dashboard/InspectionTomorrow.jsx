import React, { useEffect, useState } from "react";
import { TbCalendarSearch } from "react-icons/tb";
import { useJobAlerts } from "../../data/useJobAlerts";

const InspectionTomorrow = ({ projects = [] }) => {
  const [inspectionTomorrowCount, setInspectionTomorrowCount] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { alertInspectionTomorrow } = useJobAlerts(today);

  useEffect(() => {
    const inspectionTomorrowProjects = projects.filter(
      (project) =>
        project.jobStatus === "on process" && alertInspectionTomorrow(project) && project.jobNotificationAlert !== "ready for quotation",
    );

    setInspectionTomorrowCount(inspectionTomorrowProjects.length);
  }, [projects, today, alertInspectionTomorrow]);

  return (
    <div
      className={`round w-full rounded-sm ${
        inspectionTomorrowCount === 0
          ? "border border-secondary-200 text-secondary-300"
          : "bg-secondary-200 font-bold text-secondary-950"
      }`}
    >
      <div className="flex h-full items-center px-3 py-1">
        <TbCalendarSearch className="mr-3 text-[20px]" />
        <span>
          {inspectionTomorrowCount === 0
            ? "No inspections scheduled for tomorrow."
            : `${inspectionTomorrowCount} inspection${
                inspectionTomorrowCount !== 1 ? "s" : ""
              } scheduled for tomorrow.`}
        </span>
      </div>
    </div>
  );
};

export default InspectionTomorrow;
