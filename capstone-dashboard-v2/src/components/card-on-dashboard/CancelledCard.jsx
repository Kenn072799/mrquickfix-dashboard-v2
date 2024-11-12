import React from "react";
import { Title } from "../props/Title";
import { TbHomeCancel } from "react-icons/tb";

const CancelledCard = ({ projects = [] }) => {
  const cancelledProjects = projects.filter(
    (project) =>
      project.jobStatus == "cancelled" || project.originalStatus == "cancelled",
  );
  return (
    <div className="relative h-[120px] w-full min-w-[250px] cursor-pointer rounded-sm border-l-4 border-red-500 bg-white shadow-md shadow-secondary-100 ring-red-500 hover:ring-1 lg:min-w-[200px]">
      <div className="flex h-full flex-col justify-center px-4">
        <Title variant="primarySemibold" size="lg">
          Cancelled
        </Title>
        <Title variant="secondaryBold" size="xxxxxl">
          {cancelledProjects.length || 0}
        </Title>
      </div>
      <div className="absolute right-4 top-10">
        <TbHomeCancel className="text-6xl text-secondary-200" />
      </div>
    </div>
  );
};

export default CancelledCard;
