import React, { useEffect, useState } from "react";
import { Title } from "../components/props/Title";
import ClientInquiryCard from "../components/card-on-dashboard/ClientInquiryCard";
import OnProcessCard from "../components/card-on-dashboard/OnProcessCard";
import InProgressCard from "../components/card-on-dashboard/InProgressCard";
import CompleteCard from "../components/card-on-dashboard/CompleteCard";
import CancelledCard from "../components/card-on-dashboard/CancelledCard";
import InspectionSchedDb from "../components/project-notification-dashboard/InspectionSchedDb";
import WaitingQuotationDb from "../components/project-notification-dashboard/WaitingQuotationDb";
import StartedProjectDb from "../components/project-notification-dashboard/StartedProjectDb";
import FinishProjectDb from "../components/project-notification-dashboard/FinishProjectDb";
import DelayedProjectDb from "../components/project-notification-dashboard/DelayedProjectDb";
import ProjectWaitingUpdate from "../components/project-notification-dashboard/ProjectWaitingUpdate";
import DoughnutChartCancelled from "../components/charts/DoughnutChartCancelled";
import ProgressWaitingUpdate from "../components/project-notification-dashboard/ProgressWaitingUpdate";
import ProjectOngoingDb from "../components/project-notification-dashboard/ProjectOngoingDb";
import { useJobOrderData } from "../data/JobOrderData";
import ProjectTomorrow from "../components/project-notification-dashboard/ProjectTomorrow";
import StartAndFinishToday from "../components/project-notification-dashboard/StartAndFinishToday";
import ProjectExtended from "../components/project-notification-dashboard/ProjectExtended";
import ProjectExtendedFinishToday from "../components/project-notification-dashboard/ProjectExtendedFinishToday";
import InspectionTomorrow from "../components/project-notification-dashboard/InspectionTomorrow";
import { Link } from "react-router-dom";
import CalendarWithAlerts from "../components/project-notification-dashboard/CalendarWithAlerts";

const Dashboard = () => {
  const { projects, fetchProjects } = useJobOrderData();
  const [isCancelledDetailsVisible, setIsCancelledDetailsVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Mr. Quick Fix | Dashboard";
    const loadProjects = async () => {
      await fetchProjects();
      setIsLoading(false);
    };
    loadProjects();
  }, [fetchProjects]);

  const toggleCancelledDetails = () => {
    setIsCancelledDetailsVisible(!isCancelledDetailsVisible);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="spinner-border text-primary" role="status">
          <span className="loading loading-bars loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-screen p-4 lg:p-8">
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
          <div className="grid select-none grid-cols-1 gap-3 py-4 sm:grid-cols-2">
            <ClientInquiryCard projects={projects} />
            <OnProcessCard projects={projects} />
            <InProgressCard projects={projects} />
            <CompleteCard projects={projects} />
            <div onClick={toggleCancelledDetails}>
              <CancelledCard projects={projects} />
            </div>
          </div>
        </div>
        {/* Notifications Section */}
        <div className="flex flex-col">
          <Title variant="secondaryNormal" size="xl">
            Project Status Alert
          </Title>
          <div className="mb-2 mt-4 flex select-none flex-col gap-1 rounded-sm bg-white px-4 py-4 text-sm shadow-md shadow-secondary-100">
            <div className="flex items-center justify-between">
              <Title variant="secondarySemibold" size="lg">
                On Process
              </Title>
              <Link
                to="/track-job-orders"
                className="select-none text-sm font-semibold text-primary-500"
              >
                View Job Order
              </Link>
            </div>
            <InspectionTomorrow projects={projects} />
            <InspectionSchedDb projects={projects} />
            <ProjectWaitingUpdate projects={projects} />
            <WaitingQuotationDb projects={projects} />
          </div>

          <div className="mb-4 mt-1 flex w-full flex-col rounded-sm bg-white px-4 py-4 shadow-md shadow-secondary-100">
            <div className="flex items-center justify-between">
              <Title variant="secondarySemibold" size="lg">
                In Progress
              </Title>
              <Link
                to="/track-job-orders"
                className="select-none text-sm font-semibold text-primary-500"
              >
                View Job Order
              </Link>
            </div>
            <div className="flex w-full select-none flex-col items-end gap-1 text-sm">
              <ProjectTomorrow projects={projects} />
              <StartedProjectDb projects={projects} />
              <StartAndFinishToday projects={projects} />
              <ProgressWaitingUpdate projects={projects} />
              <ProjectOngoingDb projects={projects} />
              <FinishProjectDb projects={projects} />
              <DelayedProjectDb projects={projects} />
              <ProjectExtended projects={projects} />
              <ProjectExtendedFinishToday projects={projects} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-t-sm border border-secondary-200 bg-secondary-100 px-6 py-3 shadow-md shadow-secondary-100">
        <Title variant="secondarySemibold" size="lg">
          Project Calendar List
        </Title>
      </div>
      <CalendarWithAlerts projects={projects} />

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
            <DoughnutChartCancelled projects={projects} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
