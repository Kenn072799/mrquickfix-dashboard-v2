import React, { useEffect, useState } from "react";
import { TbExclamationCircle } from "react-icons/tb";
import { useJobAlertProgress } from "../../data/useJobAlertProgress";

const DelayedProjectDb = ({ projects = [] }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { alertProjectDelayed } = useJobAlertProgress(today);

  const [delayedProjectCount, setDelayedProjectCount] = useState(0);

  useEffect(() => {
    if (!alertProjectDelayed) return;

    const delayedProjects = projects.filter(
      (project) =>
        project.jobStatus === "in progress" && alertProjectDelayed(project),
    );

    setDelayedProjectCount(delayedProjects.length);
  }, [projects, alertProjectDelayed]);

  return (
    <div
      className={`round w-full rounded-sm ${delayedProjectCount === 0 ? "border border-secondary-200 text-secondary-300" : "bg-secondary-200 font-bold text-secondary-950"} `}
    >
      <div className="flex h-full items-center px-3 py-1">
        <TbExclamationCircle className="mr-3 text-[20px]" />
        <span>
          {delayedProjectCount === 0
            ? "No delayed projects."
            : `${delayedProjectCount} project${delayedProjectCount !== 1 ? "s" : ""} ${
                delayedProjectCount !== 1 ? "are" : "is"
              } delayed.`}
        </span>
      </div>
    </div>
  );
};

export default DelayedProjectDb;
