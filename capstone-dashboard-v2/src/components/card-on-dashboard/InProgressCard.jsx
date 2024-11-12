import React from "react";
import { Title } from "../props/Title";
import { TbHomeUp } from "react-icons/tb";

const InProgressCard = ({ projects = [] }) => {
  const inProgressProjects = projects.filter(
    (project) => project.jobStatus == "in progress",
  );
  return (
    <div className="relative h-[120px] w-full min-w-[250px] cursor-pointer rounded-sm border-l-4 border-orange-500 bg-white shadow-md shadow-secondary-100 ring-orange-500 hover:ring-1 lg:min-w-[200px]">
      <div className="flex h-full flex-col justify-center px-4">
        <Title variant="primarySemibold" size="lg">
          In Progress
        </Title>
        <Title variant="secondaryBold" size="xxxxxl">
          {inProgressProjects.length || 0}
        </Title>
      </div>
      <div className="absolute right-4 top-10">
        <TbHomeUp className="text-6xl text-secondary-200" />
      </div>
    </div>
  );
};

export default InProgressCard;
