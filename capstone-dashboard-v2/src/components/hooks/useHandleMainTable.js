import { useState, useCallback, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { useJobOrderData } from '../../data/JobOrderData';

const useHandleMainTable = () => {
  const [buttonLoading, setButtonLoading] = useState(false);
  const [quotationUploaded, setQuotationUploaded] = useState(false);
  const [finishInspectionStatus, setFinishInspectionStatus] = useState({});
  const [startProjectStatus, setStartProjectStatus] = useState({});
  const [cancelReason, setCancelReason] = useState("");
  const [jobNote, setJobNote] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Add ref to track initialization
  const isInitialized = useRef(false);

  const { fetchProjects, updateJobOrder, updateJobOrderNote, alertJobOrder, projects } = useJobOrderData();

  // Improved throttle function
  const throttle = useCallback((func, limit) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }, []);

  const throttledFetchProjects = useCallback(
    throttle(fetchProjects, 60000),
    [fetchProjects, throttle]
  );

  // Separate initialization effect from polling effect
  useEffect(() => {
    const initializeData = async () => {
      if (isInitialized.current) return;
      
      setLoading(true);
      try {
        await fetchProjects();
        const initialStartProjectStatus = {};
        projects.forEach((jobOrder) => {
          if (jobOrder.jobNotificationAlert === "ongoing project") {
            initialStartProjectStatus[jobOrder._id] = true;
          }
        });
        setStartProjectStatus(initialStartProjectStatus);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
        isInitialized.current = true;
      }
    };

    initializeData();
  }, [fetchProjects, projects]);

  // Separate polling effect
  useEffect(() => {
    if (!isInitialized.current) return;

    const intervalId = setInterval(() => {
      throttledFetchProjects();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [throttledFetchProjects]);

  const handleFinishInspection = async (jobOrder) => {
    try {
      const result = await Swal.fire({
        title: "Do you want to finish inspection?",
        showCancelButton: true,
        confirmButtonText: "Yes, Finish",
        icon: "question",
      });

      if (result.isConfirmed) {
        setFinishInspectionStatus((prevStatus) => ({
          ...prevStatus,
          jobNotificationAlert: "ready for quotation",
          [jobOrder._id]: true,
        }));

        const updateResult = await alertJobOrder(jobOrder._id, {
          jobNotificationAlert: "ready for quotation"
        });

        if (updateResult.success) {
          Swal.fire(
            "Inspection Finished",
            "You can now add a quotation.",
            "success",
          );
        } else {
          console.error("Failed to update job order:", updateResult.message);
          Swal.fire("Error", updateResult.message, "error");
          setFinishInspectionStatus((prevStatus) => ({
            ...prevStatus,
            jobNotificationAlert: "",
            [jobOrder._id]: false,
          }));
        }
      }
    } catch (error) {
      console.error("Error updating job order:", error);
      Swal.fire("Error", error.message || "Failed to update job order.", "error");
      setFinishInspectionStatus((prevStatus) => ({
        ...prevStatus,
        jobNotificationAlert: "",
        [jobOrder._id]: false,
      }));
    }
  };

  const handleStartProject = async (jobOrder) => {
    try {
      const result = await Swal.fire({
        title: "Do you want to start this project?",
        showCancelButton: true,
        confirmButtonText: "Yes, Start",
        icon: "question",
      });

      if (result.isConfirmed) {
        setStartProjectStatus((prevStatus) => ({
          ...prevStatus,
          [jobOrder._id]: true,
        }));

        const updateResult = await alertJobOrder(jobOrder._id, {
          jobNotificationAlert: "ongoing project",
        });

        if (updateResult.success) {
          Swal.fire(
            "Project Started",
            "Stay up to date with project alert.",
            "success",
          );
        } else {
          setStartProjectStatus((prevStatus) => ({
            ...prevStatus,
            [jobOrder._id]: false,
          }));
          Swal.fire("Error", "Failed to update job order.", "error");
        }
      }
    } catch (error) {
      setStartProjectStatus((prevStatus) => ({
        ...prevStatus,
        [jobOrder._id]: false,
      }));
      Swal.fire("Error", "Failed to update job order.", "error");
    }
  };

  const handleQuotationModal = async (updatedProject, setOpenQuotationModal) => {
    const result = await Swal.fire({
      title: "Do you want to save the changes?",
      showCancelButton: true,
      confirmButtonText: "Save",
    });

    if (result.isConfirmed) {
      try {
        setButtonLoading(true);

        const userID = localStorage.getItem("userID");

        if (!userID) {
          setButtonLoading(false);
          Swal.fire(
            "Error",
            "User ID is required to update the job order.",
            "error"
          );
          return;
        }

        // Create FormData for file upload
        const formData = new FormData();
        const fileInput = document.querySelector('input[type="file"]');
        
        if (!fileInput || !fileInput.files[0]) {
          setButtonLoading(false);
          Swal.fire("Error", "Please select a quotation file", "error");
          return;
        }

        // Add file and other data to FormData
        formData.append("jobQuotation", fileInput.files[0]);
        formData.append("jobStatus", "in progress");
        formData.append("updatedBy", userID);
        formData.append("jobStartDate", updatedProject.jobStartDate);
        formData.append("jobEndDate", updatedProject.jobEndDate);
        formData.append("clientEmail", updatedProject.clientEmail);
        formData.append("clientLastName", updatedProject.clientLastName);
        formData.append("clientAddress", updatedProject.clientAddress);

        const { success, message } = await updateJobOrder(
          updatedProject._id,
          formData
        );

        setButtonLoading(false);

        if (!success) {
          Swal.fire("Oops...", message, "error");
        } else {
          await fetchProjects(); // Refresh the list
          Swal.fire("Saved!", "Job order updated successfully!", "success");
          setOpenQuotationModal(false);
        }
      } catch (error) {
        setButtonLoading(false);
        Swal.fire("Error", "Failed to update job order.", "error");
      }
    }
  };

  const handleCompleteProject = async (jobOrder) => {
    try {
      const result = await Swal.fire({
        title: "Do you want to mark this project as completed?",
        showCancelButton: true,
        confirmButtonText: "Yes, Complete",
        icon: "question",
      });

      if (result.isConfirmed) {
        const userID = localStorage.getItem("userID");

        if (!userID) {
          Swal.fire(
            "Error",
            "User ID is required to update the job order.",
            "error",
          );
          return;
        }

        const updatedJob = {
          ...jobOrder,
          jobStatus: "completed",
          updatedBy: userID,
        };

        const { success, message } = await updateJobOrder(
          jobOrder._id,
          updatedJob,
        );

        if (!success) {
          Swal.fire("Oops...", message, "error");
        } else {
          Swal.fire(
            "Completed!",
            "Job order marked as completed successfully!",
            "success",
          );
        }
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update job order.", "error");
      console.error("Error updating job order:", error);
    }
  };

  const handleFileChange = (e, setUpdatedProject) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        Swal.fire("Error", "Please upload a PDF or Word document", "error");
        e.target.value = ''; // Clear the file input
        setQuotationUploaded(false);
        return;
      }
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire("Error", "File size must be less than 10MB", "error");
        e.target.value = ''; // Clear the file input
        setQuotationUploaded(false);
        return;
      }
      setQuotationUploaded(true);
      if (setUpdatedProject) {
        setUpdatedProject((prev) => ({
          ...prev,
          jobQuotation: file.name
        }));
      }
    } else {
      setQuotationUploaded(false);
      if (setUpdatedProject) {
        setUpdatedProject((prev) => ({
          ...prev,
          jobQuotation: ''
        }));
      }
    }
  };

  const handleArchiveProject = async (jobOrder) => {
    try {
      const result = await Swal.fire({
        title: "Do you want to archive this job order?",
        text: "This action will move the job order to the report list.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Archive",
        cancelButtonText: "No, Keep",
      });

      if (result.isConfirmed) {
        const userID = localStorage.getItem("userID");

        if (!userID) {
          Swal.fire(
            "Error",
            "User ID is required to archive the job order.",
            "error",
          );
          return;
        }

        const updatedJob = {
          ...jobOrder,
          jobStatus: "archived",
          originalStatus: jobOrder.jobStatus,
          updatedBy: userID,
        };

        const { success, message } = await updateJobOrder(
          jobOrder._id,
          updatedJob,
        );

        if (!success) {
          Swal.fire("Oops...", message, "error");
        } else {
          Swal.fire("Archived!", "Job order archived successfully!", "success");
        }
      }
    } catch (error) {
      Swal.fire("Error", "Failed to archive job order.", "error");
      console.error("Error archiving job order:", error);
    }
  };

  const handleCancelProject = async (selectedJobOrderForCancel, setOpenCancelModal) => {
    if (!selectedJobOrderForCancel) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No job order selected for cancellation.",
      });
      return;
    }

    if (!cancelReason.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please provide a reason for cancellation.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Do you want to cancel this project?",
      text: `This will cancel the project "${selectedJobOrderForCancel.projectID}"`,
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      icon: "question",
    });

    if (result.isConfirmed) {
      try {
        setButtonLoading(true);

        const currentStatus = selectedJobOrderForCancel.jobStatus;

        const updatedJob = {
          ...selectedJobOrderForCancel,
          jobStatus: "cancelled",
          jobPreviousStatus: currentStatus,
          updatedBy: localStorage.getItem("userID"),
          jobCancellationReason: cancelReason.trim(),
        };

        const { success, message } = await updateJobOrder(
          selectedJobOrderForCancel._id,
          updatedJob,
        );

        setButtonLoading(false);

        if (!success) {
          Swal.fire("Oops...", message, "error");
        } else {
          setCancelReason("");
          setOpenCancelModal(false);
          Swal.fire(
            "Cancelled!",
            "Job order cancelled successfully!",
            "success",
          );
        }
      } catch (error) {
        setButtonLoading(false);
        Swal.fire("Error", "Failed to cancel job order.", "error");
        console.error("Error canceling job order:", error);
      }
    }
  };

  const handleSubmitNote = async (jobOrderId, jobOrderForNote, setOpenNote) => {
    if (!jobNote) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please write a note.",
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Do you want to add this note?",
        showCancelButton: true,
        confirmButtonText: "Yes, Add",
        icon: "question",
      });

      if (result.isConfirmed) {
        const userID = localStorage.getItem("userID");

        if (!userID) {
          Swal.fire(
            "Error",
            "User ID is required to add a note to the job order.",
            "error",
          );
          return;
        }

        const noteType = jobOrderForNote?.createdNote
          ? "updatedNote"
          : "createdNote";

        const { success, message } = await updateJobOrderNote({
          jobOrderId,
          noteType,
          noteContent: jobNote,
          userID,
        });

        if (!success) {
          Swal.fire("Oops...", message, "error");
        } else {
          if (typeof setOpenNote === 'function') {
            setOpenNote(false);
          }
          setJobNote("");
          Swal.fire("Added!", "Note added successfully!", "success");
        }
      }
    } catch (error) {
      Swal.fire("Error", "Failed to add note.", "error");
      console.error("Error adding note:", error);
    }
  };

  const handleRemoveNote = async (jobOrderId, jobOrderForNote, setViewNote) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure you want to remove this note?",
        showCancelButton: true,
        confirmButtonText: "Yes, Remove",
        icon: "warning",
      });

      if (result.isConfirmed) {
        const noteType = jobOrderForNote?.createdNote
          ? "createdNote"
          : "updatedNote";

        const { success, message } = await updateJobOrderNote({
          jobOrderId,
          noteType,
          noteContent: "",
        });

        if (!success) {
          Swal.fire("Oops...", message, "error");
        } else {
          Swal.fire("Removed!", "Note removed successfully!", "success");
          if (typeof setViewNote === 'function') {
            setViewNote(false);
          }
          setJobNote("");
        }
      }
    } catch (error) {
      Swal.fire("Error", "Failed to remove note.", "error");
      console.error("Error deleting note:", error);
    }
  };

  return {
    buttonLoading,
    quotationUploaded,
    finishInspectionStatus,
    startProjectStatus,
    cancelReason,
    jobNote,
    loading,
    projects,
    setCancelReason,
    setJobNote,
    handleFinishInspection,
    handleStartProject,
    handleQuotationModal,
    handleCompleteProject,
    handleFileChange,
    handleArchiveProject,
    handleCancelProject,
    handleSubmitNote,
    handleRemoveNote,
  };
};

export default useHandleMainTable;