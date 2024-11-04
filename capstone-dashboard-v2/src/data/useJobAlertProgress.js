import { useCallback } from 'react';

export const useJobAlertProgress = (today) => {
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
    tomorrow.setHours(0, 0, 0, 0);
    return comparisonDate?.getTime() === tomorrow.getTime();
  }, [today]);

  const isDateInPast = useCallback(
    (date) => getMidnightDate(date) < today,
    [today]
  );

  const isDateInFuture = useCallback(
    (date) => getMidnightDate(date) > today,
    [today]
  );

  return {
    alertProjectStartTomorrow: (jobOrder) => isDateTomorrow(jobOrder.jobStartDate),
    alertProjectStartInPast: (jobOrder) => isDateInPast(jobOrder.jobStartDate),
  
    alertProjectStartAndFinishToday: (jobOrder) => {
      const startDate = getMidnightDate(jobOrder.jobStartDate);
      const endDate = getMidnightDate(jobOrder.jobEndDate);
      return startDate?.getTime() === endDate?.getTime() && isDateToday(startDate);
    },
  
    alertProjectStartToday: (jobOrder) => {
      const startDate = getMidnightDate(jobOrder.jobStartDate);
      const endDate = getMidnightDate(jobOrder.jobEndDate);
      return isDateToday(startDate) && startDate?.getTime() !== endDate?.getTime();
    },
  
    alertProjectFinishToday: (jobOrder) => {
      const startDate = getMidnightDate(jobOrder.jobStartDate);
      const endDate = getMidnightDate(jobOrder.jobEndDate);
      return isDateToday(endDate) && startDate?.getTime() !== endDate?.getTime(); // Check that start and end are not the same
    },
  
    alertProjectDelayed: (jobOrder) => {
      const endDate = getMidnightDate(jobOrder.jobEndDate);
      const extendedDate = getMidnightDate(jobOrder.jobExtendedDate);
      return isDateInPast(endDate) && (!extendedDate || isDateInPast(extendedDate));
    },
  
    alertProjectExtended: (jobOrder) => {
      const extendedDate = getMidnightDate(jobOrder.jobExtendedDate);
      return extendedDate && isDateInFuture(extendedDate);
    },
  
    alertProjectExtendedFinishToday: (jobOrder) => {
      const extendedDate = getMidnightDate(jobOrder.jobExtendedDate);
      return extendedDate && isDateToday(extendedDate);
    },
  };
  
};
