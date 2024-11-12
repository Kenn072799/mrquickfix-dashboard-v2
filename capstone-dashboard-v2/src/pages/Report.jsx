import React, { useEffect, useState } from "react";
import { useJobOrderData } from "../data/JobOrderData";
import { Title } from "../components/props/Title";
import CompletedTableReport from "../components/table/CompletedTableReport";

import CancelledTableReport from "../components/table/CancelledTableReport";
import LineChartCC from "../components/charts/LineChartCC";
import BarChartTopServices from "../components/charts/BarChartTopServices";
import LineChartClientInquiry from "../components/charts/LineChartClientInquiry";

const Report = () => {
  const { fetchProjects, projects, error } = useJobOrderData();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Mr. Quick Fix | Reports";
    const fetchData = async () => {
      setLoading(true);
      await fetchProjects();
      setLoading(false);
    };
    fetchData();
  }, [fetchProjects]);

  return (
    <div className="mt-16 min-h-screen p-4 lg:p-8">
      <div className="pb-4">
        <Title variant="secondaryBold" size="xxxl">
          Reports
        </Title>
      </div>

      {/* Charts Section */}
      <Title variant="secondaryNormal" size="xl">
        Analytics
      </Title>
      <div className="grid grid-cols-1 gap-6 pb-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Line Chart */}
        <div className="flex flex-col">
          <div className="mt-4 rounded-t-sm border border-secondary-200 bg-secondary-100 px-6 py-3 shadow-md shadow-secondary-100">
            <Title variant="secondarySemibold" size="lg">
              Client Inquiry Overview
            </Title>
          </div>
          <div className="mb-4 rounded-b-sm border-x border-b border-secondary-200 bg-white p-2 shadow-md shadow-secondary-100">
            <LineChartClientInquiry projects={projects} />
          </div>
        </div>

        {/* Line Chart */}
        <div className="flex flex-col">
          <div className="mt-4 rounded-t-sm border border-secondary-200 bg-secondary-100 px-6 py-3 shadow-md shadow-secondary-100">
            <Title variant="secondarySemibold" size="lg">
              Completed and Cancelled Project
            </Title>
          </div>
          <div className="mb-4 rounded-b-sm border-x border-b border-secondary-200 bg-white p-2 shadow-md shadow-secondary-100">
            <LineChartCC projects={projects} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="flex flex-col">
          <div className="mt-4 rounded-t-sm border border-secondary-200 bg-secondary-100 px-6 py-3 shadow-md shadow-secondary-100">
            <Title variant="secondarySemibold" size="lg">
              Top Job Services
            </Title>
          </div>
          <div className="mb-4 rounded-b-sm border-x border-b border-secondary-200 bg-white p-2 shadow-md shadow-secondary-100">
            <BarChartTopServices projects={projects} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-4">
        <Title variant="secondaryNormal" size="xl">
          Table Reports
        </Title>
      </div>
      <div className="border border-secondary-200">
        <div className="border-b border-secondary-200 bg-secondary-100 px-4 py-2">
          <Title variant="secondarySemibold" size="lg">
            Completed Report
          </Title>
        </div>
        <div className="bg-white p-4">
          <CompletedTableReport
            projects={projects}
            loading={loading}
            error={error}
          />
        </div>
      </div>

      <div className="mt-4 border border-secondary-200">
        <div className="border-b border-secondary-200 bg-secondary-100 px-4 py-2">
          <Title variant="secondarySemibold" size="lg">
            Cancelled Report
          </Title>
        </div>
        <div className="bg-white p-4">
          <CancelledTableReport
            projects={projects}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default Report;
