import React, { useState, useEffect } from "react";
import { Title } from "../props/Title";
import NoData from "../../assets/undraw_No_data_re_kwbl.png";
import {
  TbChecklist,
  TbChevronLeft,
  TbChevronRight,
  TbEye,
  TbFilePlus,
  TbTrash,
  TbX,
  TbCalendarSearch,
  TbSortAscending,
  TbSortDescending,
} from "react-icons/tb";
import { useJobOrderData } from "../../data/JobOrderData";
import {
  Button,
  Chip,
  Tooltip,
  Input,
  Textarea,
} from "@material-tailwind/react";
import Swal from "sweetalert2";
import useCapitalize from "../hooks/useCapitalize";

const InquiryAction = ({
  inquiry,
  onView,
  onReceive,
  onInspection,
  onQuotation,
  onDelete,
}) => {
  return (
    <td className="flex justify-end gap-3 px-4 py-2 text-right">
      {inquiry.inquiryStatus === "pending" && (
        <Tooltip
          content="Form Received"
          className="!bg-opacity-60"
          placement="left"
          animate={{
            mount: { scale: 1, y: 0 },
            unmount: { scale: 0, y: 25 },
          }}
        >
          <Button
            className="!bg-orange-500 !p-1"
            onClick={() => onReceive(inquiry)}
          >
            <TbChecklist className="text-[20px]" />
          </Button>
        </Tooltip>
      )}
      {inquiry.inquiryStatus === "received" && (
        <>
          <Tooltip
            content="Set Inspection Date"
            className="!bg-opacity-60"
            placement="left"
            animate={{
              mount: { scale: 1, y: 0 },
              unmount: { scale: 0, y: 25 },
            }}
          >
            <Button
              className="!bg-blue-500 !p-1"
              onClick={() => onInspection(inquiry)}
            >
              <TbCalendarSearch className="text-[20px]" />
            </Button>
          </Tooltip>
          <Tooltip
            content="Send Quotation"
            className="!bg-opacity-60"
            placement="left"
            animate={{
              mount: { scale: 1, y: 0 },
              unmount: { scale: 0, y: 25 },
            }}
          >
            <Button
              className="!bg-green-500 !p-1"
              onClick={() => onQuotation(inquiry)}
            >
              <TbFilePlus className="text-[20px]" />
            </Button>
          </Tooltip>
        </>
      )}
      <Tooltip
        content="View Details "
        className="!bg-opacity-60"
        placement="left"
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0, y: 25 },
        }}
      >
        <Button className="!bg-blue-500 !p-1" onClick={() => onView(inquiry)}>
          <TbEye className="text-[20px]" />
        </Button>
      </Tooltip>
      <Tooltip
        content="Delete Inquiry"
        className="!bg-opacity-60"
        placement="left"
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0, y: 25 },
        }}
      >
        <Button className="!bg-red-500 !p-1" onClick={() => onDelete(inquiry)}>
          <TbTrash className="text-[20px]" />
        </Button>
      </Tooltip>
    </td>
  );
};

const InquiryRow = ({
  inquiry,
  index,
  currentPage,
  itemsPerPage,
  onView,
  onReceive,
  onInspection,
  onQuotation,
  onDelete,
}) => {
  const statusColors = {
    pending: "amber",
    received: "blue",
  };

  const { capitalizeWords } = useCapitalize();

  return (
    <tr className="bg-white text-sm hover:bg-secondary-50">
      <td className="w-[10px] whitespace-nowrap px-4 py-2">
        {(currentPage - 1) * itemsPerPage + index + 1}
      </td>
      <td className="w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
        {capitalizeWords(inquiry.clientFirstName)}{" "}
        {capitalizeWords(inquiry.clientLastName)}
      </td>
      <td className="w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
        {inquiry.jobType}
      </td>
      <td className="w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
        <div className="w-max">
          <Chip
            variant="ghost"
            color={statusColors[inquiry.inquiryStatus]}
            value={inquiry.inquiryStatus}
          />
        </div>
      </td>
      <td className="w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
        {inquiry.clientMessage || "N/A"}
      </td>
      <InquiryAction
        inquiry={inquiry}
        onView={onView}
        onReceive={onReceive}
        onInspection={onInspection}
        onQuotation={onQuotation}
        onDelete={onDelete}
      />
    </tr>
  );
};

const InquiryTable = () => {
  const {
    fetchProjects,
    projects,
    updateJobOrder,
    updateInquiryStatus,
    deleteJobOrder,
  } = useJobOrderData();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [openQuotationModal, setOpenQuotationModal] = useState(false);
  const [openInspectionModal, setOpenInspectionModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [updatedProject, setUpdatedProject] = useState({});
  const [buttonLoading, setButtonLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [quotationUploaded, setQuotationUploaded] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchProjects();
      setLoading(false);
    };
    fetchData();
  }, [fetchProjects]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortDirection = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? (
        <TbSortAscending className="text-lg" />
      ) : (
        <TbSortDescending className="text-lg" />
      );
    }
    return (
      <TbSortAscending className="text-lg opacity-0 group-hover:opacity-50" />
    );
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.inquiryStatus === "pending" ||
      project.inquiryStatus === "received",
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue =
      sortConfig.key === "name"
        ? `${a.clientFirstName} ${a.clientLastName}`
        : sortConfig.key === "message"
          ? a.clientMessage || ""
          : a[sortConfig.key];
    const bValue =
      sortConfig.key === "name"
        ? `${b.clientFirstName} ${b.clientLastName}`
        : sortConfig.key === "message"
          ? b.clientMessage || ""
          : b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const currentInquiries = sortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);

  const handleOpenViewModal = (project) => {
    setSelectedProject(project);
    setOpenViewModal(true);
  };

  const handleDelete = async (project) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete this inquiry?",
      icon: "warning",
      text: "You won't be able to recover this!",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
    });

    if (result.isConfirmed) {
      try {
        await deleteJobOrder(project._id);
        await fetchProjects();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The inquiry has been deleted successfully.",
        });
      } catch (error) {
        console.error("Error deleting project:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
        });
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        Swal.fire("Error", "Please upload a PDF or Word document", "error");
        e.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire("Error", "File size must be less than 10MB", "error");
        e.target.value = "";
        return;
      }
      setQuotationUploaded(true);
      setUpdatedProject((prev) => ({
        ...prev,
        jobQuotation: file.name,
      }));
    } else {
      setQuotationUploaded(false);
      setUpdatedProject((prev) => ({
        ...prev,
        jobQuotation: "",
      }));
    }
  };

  const handleProceedQuotation = () => {
    if (
      !updatedProject.jobQuotation ||
      !updatedProject.jobStartDate ||
      !updatedProject.jobEndDate
    ) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please provide a quotation file, start date, and end date.",
      });
      return;
    }
    handleQuotationSubmit();
  };

  const openQuotation = (project) => {
    setSelectedProject(project);
    setUpdatedProject(project);
    setOpenQuotationModal(true);
  };

  const openInspection = (project) => {
    setSelectedProject(project);
    setUpdatedProject(project);
    setOpenInspectionModal(true);
  };

  const handleInspection = () => {
    if (!updatedProject.jobInspectionDate) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please provide an inspection date.",
      });
      return;
    }
    handleInspectionSubmit();
  };

  const handleInspectionSubmit = async () => {
    const result = await Swal.fire({
      title: "Set Inspection?",
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
            "error",
          );
          return;
        }

        const updatedJob = {
          ...updatedProject,
          jobStatus: "on process",
          inquiryStatus: "",
          updatedBy: userID,
        };

        const { success, message } = await updateJobOrder(
          updatedProject._id,
          updatedJob,
        );

        setButtonLoading(false);

        if (!success) {
          Swal.fire("Oops...", message, "error");
        } else {
          Swal.fire("Saved!", "Inspection Set Successfully!", "success");
          setOpenInspectionModal(false);
        }
      } catch (error) {
        setButtonLoading(false);
        Swal.fire("Error", "Failed to update job order.", "error");
      }
    }
  };

  const handleQuotationSubmit = async () => {
    const result = await Swal.fire({
      title: "Submit Quotation?",
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
            "error",
          );
          return;
        }

        const formData = new FormData();

        const fileInput = document.querySelector('input[type="file"]');
        if (!fileInput || !fileInput.files[0]) {
          setButtonLoading(false);
          Swal.fire("Error", "Please select a quotation file", "error");
          return;
        }

        formData.append("jobQuotation", fileInput.files[0]);
        formData.append("jobStatus", "in progress");
        formData.append("inquiryStatus", "");
        formData.append("jobStartDate", updatedProject.jobStartDate);
        formData.append("jobEndDate", updatedProject.jobEndDate);
        formData.append("clientEmail", updatedProject.clientEmail);
        formData.append("clientLastName", updatedProject.clientLastName);
        formData.append("clientAddress", updatedProject.clientAddress);
        formData.append("updatedBy", userID);

        const { success, message } = await updateJobOrder(
          updatedProject._id,
          formData,
        );

        setButtonLoading(false);

        if (!success) {
          Swal.fire("Oops...", message, "error");
        } else {
          Swal.fire("Saved!", "Quotation submitted successfully!", "success");
          setOpenQuotationModal(false);
          await fetchProjects();
        }
      } catch (error) {
        setButtonLoading(false);
        Swal.fire("Error", "Failed to update job order.", "error");
      }
    }
  };

  const handleFormReceived = async (jobOrder) => {
    try {
      const result = await Swal.fire({
        title: "Do you want to mark this inquiry as received ?",
        showCancelButton: true,
        confirmButtonText: "Yes, Received",
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
          inquiryStatus: "received",
          updatedBy: userID,
          clientEmail: jobOrder.clientEmail,
          clientLastName: jobOrder.clientLastName,
        };

        const { success, message } = await updateInquiryStatus(
          jobOrder._id,
          updatedJob,
        );

        if (!success) {
          Swal.fire("Oops...", message, "error");
        } else {
          await fetchProjects();
          Swal.fire(
            "Success!",
            "Inquiry marked as received successfully!",
            "success",
          );
        }
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update job order.", "error");
      console.error("Error updating job order:", error);
    }
  };

  return (
    <>
      <div className="border border-secondary-200 bg-white">
        <div className="border-b border-secondary-200 bg-secondary-100 px-4 py-2">
          <Title variant="secondarySemibold" size="lg">
            Inquiry List
          </Title>
        </div>
        <div className="overflow-auto bg-white p-4">
          <table className="min-w-full divide-y-2 divide-secondary-100 border-b border-secondary-100 text-sm">
            <thead className="text-left">
              <tr className="whitespace-nowrap text-primary-500">
                <th className="px-4 py-2">No</th>
                <th
                  className={`group relative cursor-pointer px-4 py-2 hover:bg-secondary-50 ${
                    sortConfig.key === "name" ? "bg-secondary-50" : ""
                  }`}
                  onClick={() => requestSort("name")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>Name</span>
                    {getSortDirection("name")}
                  </div>
                </th>
                <th
                  className={`group relative cursor-pointer px-4 py-2 hover:bg-secondary-50 ${
                    sortConfig.key === "jobType" ? "bg-secondary-50" : ""
                  }`}
                  onClick={() => requestSort("jobType")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>Job Type</span>
                    {getSortDirection("jobType")}
                  </div>
                </th>
                <th
                  className={`group relative cursor-pointer px-4 py-2 hover:bg-secondary-50 ${
                    sortConfig.key === "inquiryStatus" ? "bg-secondary-50" : ""
                  }`}
                  onClick={() => requestSort("inquiryStatus")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>Status</span>
                    {getSortDirection("inquiryStatus")}
                  </div>
                </th>
                <th
                  className={`group relative cursor-pointer px-4 py-2 hover:bg-secondary-50 ${
                    sortConfig.key === "message" ? "bg-secondary-50" : ""
                  }`}
                  onClick={() => requestSort("message")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>Message</span>
                    {getSortDirection("message")}
                  </div>
                </th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="h-[400px] text-center">
                    <span className="loading loading-bars loading-lg bg-primary-500"></span>
                  </td>
                </tr>
              ) : currentInquiries.length ? (
                currentInquiries.map((inquiry, index) => (
                  <InquiryRow
                    key={inquiry._id}
                    inquiry={inquiry}
                    index={index}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onView={handleOpenViewModal}
                    onReceive={handleFormReceived}
                    onInspection={openInspection}
                    onQuotation={openQuotation}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <img src={NoData} alt="No Data" className="h-48" />
                      <p className="text-secondary-500">No inquiries found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mb-4 flex justify-center gap-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="cursor-pointer"
          >
            <TbChevronLeft className="text-secondary-500 hover:text-secondary-800" />
          </button>
          <span className="text-sm text-secondary-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="cursor-pointer"
          >
            <TbChevronRight className="text-secondary-500 hover:text-secondary-800" />
          </button>
        </div>
      </div>

      {/* Quotation Modal */}
      {openQuotationModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20 px-4">
          <div className="w-full animate-fade-down animate-duration-[400ms] animate-ease-out">
            <div className="mx-auto w-full max-w-[500px]">
              <div className="flex items-center justify-between rounded-t-md border border-b-0 border-secondary-300 bg-secondary-100 px-4 py-2">
                <Title>Add Quotation</Title>
                <div
                  className="flex cursor-pointer items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
                  onClick={() => setOpenQuotationModal(false)}
                >
                  <button>
                    <TbX />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-b-md border border-secondary-300 bg-white p-4">
                <Title variant="secondaryBold" size="sm">
                  Upload and specify the timeline for your project
                </Title>
                {/* Client Address */}
                <Input
                  label="Client Address"
                  value={updatedProject.clientAddress || ""}
                  onChange={(e) =>
                    setUpdatedProject((prev) => ({
                      ...prev,
                      clientAddress: e.target.value,
                    }))
                  }
                />
                {/* Upload Quotation File */}
                <Input
                  type="file"
                  label="Upload Quotation"
                  className="!py-2"
                  onChange={handleFileChange}
                />
                {/* Start and End Date */}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    label="Start Date"
                    type="date"
                    value={updatedProject.jobStartDate || ""}
                    onChange={(e) =>
                      setUpdatedProject((prev) => ({
                        ...prev,
                        jobStartDate: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={updatedProject.jobEndDate || ""}
                    onChange={(e) =>
                      setUpdatedProject((prev) => ({
                        ...prev,
                        jobEndDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  onClick={handleProceedQuotation}
                  disabled={buttonLoading}
                  className="bg-primary-500"
                >
                  {buttonLoading ? (
                    <span className="loading loading-dots loading-sm h-1 py-2"></span>
                  ) : (
                    <>Proceed to in progress</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {openInspectionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20 px-4">
          <div className="w-full animate-fade-down animate-duration-[400ms] animate-ease-out">
            <div className="mx-auto w-full max-w-[500px]">
              <div className="flex items-center justify-between rounded-t-md border border-b-0 border-secondary-300 bg-secondary-100 px-4 py-2">
                <Title>Set Inspection Date</Title>
                <div
                  className="flex cursor-pointer items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
                  onClick={() => setOpenInspectionModal(false)}
                >
                  <button>
                    <TbX />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-b-md border border-secondary-300 bg-white p-4">
                <Title variant="secondaryBold" size="sm">
                  Set inspection date
                </Title>
                {/* Client Address */}
                <Input
                  label="Client Address"
                  value={updatedProject.clientAddress || ""}
                  onChange={(e) =>
                    setUpdatedProject((prev) => ({
                      ...prev,
                      clientAddress: e.target.value,
                    }))
                  }
                />
                {/* Inspection Date */}
                <Input
                  label="Inspection Date"
                  type="date"
                  value={updatedProject.jobInspectionDate || ""}
                  onChange={(e) =>
                    setUpdatedProject((prev) => ({
                      ...prev,
                      jobInspectionDate: e.target.value,
                    }))
                  }
                />
                <Button
                  onClick={handleInspection}
                  disabled={buttonLoading}
                  className="bg-blue-500"
                >
                  {buttonLoading ? (
                    <span className="loading loading-dots loading-sm h-1 py-2"></span>
                  ) : (
                    <>Proceed to on process</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {openViewModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20 px-4">
          <div className="w-full animate-fade-down animate-duration-[400ms] animate-ease-out">
            <div className="mx-auto w-full max-w-[500px]">
              <div className="flex items-center justify-between rounded-t-md border border-b-0 border-secondary-300 bg-secondary-100 px-4 py-2">
                <Title>Inquiry Details</Title>
                <div
                  className="flex cursor-pointer items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
                  onClick={() => setOpenViewModal(false)}
                >
                  <button>
                    <TbX />
                  </button>
                </div>
              </div>
              <div className="flex max-h-[90vh] flex-col gap-4 overflow-y-auto rounded-b-md border border-secondary-300 bg-white p-4">
                {selectedProject && (
                  <>
                    <div className="flex items-center text-sm font-semibold">
                      <span className="whitespace-nowrap pr-2 text-secondary-500">
                        Client Information
                      </span>
                      <div className="my-2 h-[1px] w-full bg-secondary-200 text-sm"></div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        label="First Name"
                        value={selectedProject.clientFirstName || ""}
                        readOnly
                      />
                      <Input
                        label="Last Name"
                        value={selectedProject.clientLastName || ""}
                        readOnly
                      />
                    </div>
                    <Input
                      label="Email"
                      value={selectedProject.clientEmail || ""}
                      readOnly
                    />
                    <Input
                      label="Phone"
                      value={selectedProject.clientPhone || ""}
                      readOnly
                    />
                    <div className="flex items-center text-sm font-semibold">
                      <span className="whitespace-nowrap pr-2 text-secondary-500">
                        Job Order Information
                      </span>
                      <div className="my-2 h-[1px] w-full bg-secondary-200 text-sm"></div>
                    </div>
                    <Input
                      label="Job Type"
                      value={selectedProject.jobType || ""}
                      readOnly
                    />
                    <Input
                      label="Job Services"
                      value={selectedProject.jobServices || ""}
                      readOnly
                    />
                    <Input
                      label="Inquire Date"
                      value={new Date(selectedProject.createdAt).toLocaleString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        },
                      )}
                      readOnly
                    />
                    <Textarea
                      label="Message"
                      value={selectedProject.clientMessage || "N/A"}
                      readOnly
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InquiryTable;
