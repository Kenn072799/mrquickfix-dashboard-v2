import React from "react";
import { Title } from "../props/Title";
import { TbHomeCheck } from "react-icons/tb";

const CompleteCard = ({ projects = [] }) => {
  const completedProjects = projects.filter(
    (project) =>
      project.jobStatus == "completed" || project.originalStatus == "completed",
  );
  return (
    <div className="relative h-[120px] w-full min-w-[250px] cursor-pointer rounded-sm border-l-4 border-green-500 bg-white shadow-md shadow-secondary-100 ring-green-500 hover:ring-1 lg:min-w-[200px]">
      <div className="flex h-full flex-col justify-center px-4">
        <Title variant="primarySemibold" size="lg">
          Completed
        </Title>
        <Title variant="secondaryBold" size="xxxxxl">
          {completedProjects.length || 0}
        </Title>
      </div>
      <div className="absolute right-4 top-10">
        <TbHomeCheck className="text-6xl text-secondary-200" />
      </div>
    </div>
  );
};

export default CompleteCard;
