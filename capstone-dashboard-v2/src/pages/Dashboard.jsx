import React, { useState } from "react";
import { Title } from "../components/props/Title";
// cards
import ClientInquiryCard from "../components/card-on-dashboard/ClientInquiryCard";
import OnProcessCard from "../components/card-on-dashboard/OnProcessCard";
import InProgressCard from "../components/card-on-dashboard/InProgressCard";
import CompleteCard from "../components/card-on-dashboard/CompleteCard";
import CancelledCard from "../components/card-on-dashboard/CancelledCard";

// charts
import LineChartClientInquiry from "../components/charts/LineChartClientInquiry";
import BarChartTopServices from "../components/charts/BarChartTopServices";

// project notification
import InspectionSchedDb from "../components/project-notification-dashboard/InspectionSchedDb";
import WaitingQuotationDb from "../components/project-notification-dashboard/WaitingQuotationDb";
import StartedProjectDb from "../components/project-notification-dashboard/StartedProjectDb";
import FinishProjectDb from "../components/project-notification-dashboard/FinishProjectDb";
import DelayedProjectDb from "../components/project-notification-dashboard/DelayedProjectDb";
import ProjectWaitingUpdate from "../components/project-notification-dashboard/ProjectWaitingUpdate";
import DoughnutChartCancelled from "../components/charts/DoughnutChartCancelled";
import ProgressWaitingUpdate from "../components/project-notification-dashboard/ProgressWaitingUpdate";
import ProjectOngoingDb from "../components/project-notification-dashboard/ProjectOngoingDb";

const Dashboard = () => {
  const [isCancelledDetailsVisible, setIsCancelledDetailsVisible] =
    useState(false);

  const toggleCancelledDetails = () => {
    setIsCancelledDetailsVisible(!isCancelledDetailsVisible);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <Title variant="secondaryBold" size="xxxl">
        Dashboard
      </Title>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Project Monitoring Section */}
        <div className="lg:col-span-2">
          <Title variant="secondaryNormal" size="xl">
            Project Monitoring
          </Title>

          {/* Cards Section */}
          <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-2">
            <ClientInquiryCard />
            <OnProcessCard />
            <InProgressCard />
            <CompleteCard />
            <div onClick={toggleCancelledDetails}>
              <CancelledCard />
            </div>
          </div>
        </div>
        {/* Notifications Section */}
        <div className="flex flex-col">
          <Title variant="secondaryNormal" size="xl">
            Project Status Alert
          </Title>
          <div className="mb-2 mt-4 flex flex-col gap-1 rounded-sm bg-white px-4 py-4 shadow-md shadow-secondary-100">
            <Title variant="secondarySemibold" size="lg">
              On Process
            </Title>
            <InspectionSchedDb />
            <ProjectWaitingUpdate />
            <WaitingQuotationDb />
          </div>

          <div className="mb-4 mt-1 flex flex-col gap-1 rounded-sm bg-white px-4 py-4 shadow-md shadow-secondary-100">
            <Title variant="secondarySemibold" size="lg">
              In Progress
            </Title>
            <StartedProjectDb />
            <ProgressWaitingUpdate />
            <ProjectOngoingDb />
            <FinishProjectDb />
            <DelayedProjectDb />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 pb-4 sm:grid-cols-2 xl:grid-cols-3">
        {/* Line Chart */}
        <div className="flex flex-col">
          <div className="mt-4 rounded-t-sm border border-secondary-200 bg-secondary-100 px-6 py-3 shadow-md shadow-secondary-100">
            <Title variant="secondarySemibold" size="lg">
              Client Inquiry Overview
            </Title>
          </div>
          <div className="mb-4 rounded-b-sm border-x border-b border-secondary-200 bg-white px-6 pb-6 pt-4 shadow-md shadow-secondary-100">
            <LineChartClientInquiry />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="flex flex-col">
          <div className="mt-4 rounded-t-sm border border-secondary-200 bg-secondary-100 px-6 py-3 shadow-md shadow-secondary-100">
            <Title variant="secondarySemibold" size="lg">
              Top Job Services
            </Title>
          </div>
          <div className="mb-4 rounded-b-sm border-x border-b border-secondary-200 bg-white px-6 pb-6 pt-4 shadow-md shadow-secondary-100">
            <BarChartTopServices />
          </div>
        </div>
      </div>

      {/* Slide Section */}
      {/* Slide down cancel details */}
      {isCancelledDetailsVisible && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20"
          onClick={() => setIsCancelledDetailsVisible(false)}
        >
          <div
            className="mx-4 w-full max-w-[290px] animate-fade-down rounded-md bg-white p-4 shadow-md animate-duration-[800ms] animate-ease-out md:max-w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Title>Cancelled details</Title>
            <DoughnutChartCancelled />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
