import React from "react";
import { Title } from "../props/Title";
import { TbHomeCog } from "react-icons/tb";

const processTotal = 10;

const OnProcessCard = () => {
  return (
    <div className="relative h-[120px] w-full min-w-[250px] cursor-pointer rounded-sm border-l-4 border-blue-500 bg-white shadow-md shadow-secondary-100 ring-blue-500 hover:ring-1 lg:min-w-[200px]">
      <div className="flex h-full flex-col justify-center px-4">
        <Title variant="primarySemibold" size="lg">
          On Process
        </Title>
        <Title variant="secondaryBold" size="xxxxxl">
          {processTotal}
        </Title>
      </div>
      <div className="absolute right-4 top-10">
        <TbHomeCog className="text-6xl text-secondary-200" />
      </div>
    </div>
  );
};

export default OnProcessCard;
