import { useCallback } from 'react';

export const useJobAlerts = (today) => {
  const getMidnightDate = useCallback((date) => {
    if (!date) return null;
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }, []);

  const isDateToday = useCallback(
    (date) => getMidnightDate(date)?.getTime() === today.getTime(),
    [today]
  );

  const isDateTomorrow = useCallback((date) => {
    const comparisonDate = getMidnightDate(date);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return comparisonDate?.getTime() === tomorrow.getTime();
  }, [today]);

  const isDateInPast = useCallback(
    (date) => getMidnightDate(date) < today,
    [today]
  );

  return {
    alertInspectionTomorrow: (jobOrder) => isDateTomorrow(jobOrder.jobInspectionDate),
    alertInspectionToday: (jobOrder) => isDateToday(jobOrder.jobInspectionDate),
    alertWaitingUpdate: (jobOrder) => isDateInPast(jobOrder.jobInspectionDate),
  };
};