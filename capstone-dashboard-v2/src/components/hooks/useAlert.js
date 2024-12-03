import {
  TbCalendarSearch,
  TbHomeSearch,
  TbClockUp,
  TbReportMoney,
  TbClock24,
  TbCalendarEvent,
  TbCalendarBolt,
  TbCalendarCheck,
  TbExclamationCircle,
  TbCalendarPlus,
  TbCalendarClock,
} from "react-icons/tb";

const useAlert = (alertInspectionTomorrow, alertInspectionToday, alertWaitingUpdate, finishInspectionStatus, alertProjectStartTomorrow, alertProjectStartToday, alertProjectStartInPast, alertProjectStartAndFinishToday, alertProjectFinishToday, alertProjectDelayed, alertProjectExtended, alertProjectExtendedFinishToday, startProjectStatus) => {
  const jobNotificationAlertProcess = [
    {
      message: "inspection tomorrow",
      icon: TbCalendarSearch,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "on process" &&
        alertInspectionTomorrow(jobOrder),
    },
    {
      message: "up for inspection",
      icon: TbHomeSearch,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "on process" && alertInspectionToday(jobOrder),
    },
    {
      message: "waiting for update",
      icon: TbClockUp,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "on process" && alertWaitingUpdate(jobOrder),
    },
    {
      message: "ready for quotation",
      icon: TbReportMoney,
      condition: (jobOrder) => finishInspectionStatus[jobOrder._id] === true,
    },
  ];

  const jobNotificationAlertProgress = [
    {
      message: "Project starts tomorrow",
      icon: TbClock24,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" &&
        alertProjectStartTomorrow(jobOrder),
    },
    {
      message: "Project starts today",
      icon: TbCalendarEvent,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" &&
        alertProjectStartToday(jobOrder),
    },
    {
      message: "Waiting for update",
      icon: TbClockUp,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" &&
        alertProjectStartInPast(jobOrder) &&
        jobOrder.jobNotificationAlert !== "ongoing project",
    },
    {
      message: "Project starts and finishes today",
      icon: TbCalendarBolt,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" &&
        alertProjectStartAndFinishToday(jobOrder),
    },
    {
      message: "Project finishes today",
      icon: TbCalendarCheck,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" &&
        alertProjectFinishToday(jobOrder),
    },
    {
      message: "Project is delayed",
      icon: TbExclamationCircle,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" && alertProjectDelayed(jobOrder),
    },
    {
      message: "Project extended",
      icon: TbCalendarPlus,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" && alertProjectExtended(jobOrder),
    },
    {
      message: "Extended project finishes today",
      icon: TbCalendarCheck,
      condition: (jobOrder) =>
        jobOrder.jobStatus === "in progress" &&
        alertProjectExtendedFinishToday(jobOrder),
    },
    {
      message: "Ongoing project",
      icon: TbCalendarClock,
      condition: (jobOrder) =>
        (jobOrder.jobStatus === "in progress" &&
          startProjectStatus[jobOrder._id]) ||
        jobOrder.jobNotificationAlert === "ongoing project",
    },
  ];

  return {
    jobNotificationAlertProcess,
    jobNotificationAlertProgress,
  };
};

export default useAlert;
