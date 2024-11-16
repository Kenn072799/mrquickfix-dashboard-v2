import React, { useEffect, useState } from "react";
import { TbHomeSearch } from "react-icons/tb";
import { useJobAlerts } from "../../data/useJobAlerts";
const InspectionSchedDb = ({ projects = [] }) => {
  const [inspectionTodayCount, setInspectionTodayCount] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { alertInspectionToday } = useJobAlerts(today);

  useEffect(() => {
    const inspectionTodayProjects = projects.filter((project) => {
      return (
        project.jobStatus === "on process" && alertInspectionToday(project) && project.jobNotificationAlert !== "ready for quotation"
      );
    });

    setInspectionTodayCount(inspectionTodayProjects.length);
  }, [projects, today, alertInspectionToday]);

  return (
    <div
      className={`round w-full rounded-sm ${
        inspectionTodayCount === 0
          ? "border border-secondary-200 text-secondary-300"
          : "bg-secondary-200 font-bold text-secondary-950"
      }`}
    >
      <div className="flex h-full items-center px-3 py-1">
        <TbHomeSearch className="mr-3 text-[20px]" />
        <span>
          {inspectionTodayCount === 0
            ? "No inspections scheduled for today."
            : `${inspectionTodayCount} inspection${
                inspectionTodayCount !== 1 ? "s" : ""
              } scheduled for today.`}
        </span>
      </div>
    </div>
  );
};

export default InspectionSchedDb;
