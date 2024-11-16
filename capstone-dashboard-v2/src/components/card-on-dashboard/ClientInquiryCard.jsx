import React from "react";
import { Title } from "../props/Title";
import { TbHomeEdit } from "react-icons/tb";

const ClientInquiryCard = ({ projects = [] }) => {
  const clientProjects = projects.filter(
    (project) =>
      project.inquiryStatus == "pending" || project.inquiryStatus == "received",
  );
  return (
    <div className="relative h-[120px] w-full min-w-[250px] cursor-pointer rounded-sm border-l-4 border-secondary-500 bg-white shadow-md shadow-secondary-100 ring-secondary-500 hover:ring-1 lg:min-w-[200px]">
      <div className="flex h-full flex-col justify-center px-4">
        <Title variant="primarySemibold" size="lg">
          Client Inquiry
        </Title>
        <Title variant="secondaryBold" size="xxxxxl">
          {clientProjects.length || 0}
        </Title>
      </div>
      <div className="absolute right-4 top-10">
        <TbHomeEdit className="text-6xl text-secondary-200" />
      </div>
    </div>
  );
};

export default ClientInquiryCard;
