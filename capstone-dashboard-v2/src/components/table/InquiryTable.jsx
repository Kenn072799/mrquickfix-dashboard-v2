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
} from "react-icons/tb";
import { useJobOrderData } from "../../data/JobOrderData";
import {
  Button,
  Chip,
  Tooltip,
  Typography,
  Input,
  Textarea,
} from "@material-tailwind/react";
import Swal from "sweetalert2";

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchProjects();
      setLoading(false);
    };
    fetchData();
  }, [fetchProjects]);

  const filteredProjects = projects.filter(
    (project) =>
      project.inquiryStatus === "pending" ||
      project.inquiryStatus === "received",
  );

  const statusColors = {
    pending: "amber",
    received: "blue",
  };

  const totalPages =
    filteredProjects && filteredProjects.length
      ? Math.ceil(filteredProjects.length / itemsPerPage)
      : 1;

  const currentInquiries = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
    setQuotationUploaded(!!file);
    setUpdatedProject((prev) => ({
      ...prev,
      jobQuotation: file ? file.name : "",
    }));
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

        const updatedJob = {
          ...updatedProject,
          jobStatus: "in progress",
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
          Swal.fire("Saved!", "Quotation submitted successfully!", "success");
          setOpenQuotationModal(false);
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
        };

        const { success, message } = await updateInquiryStatus(
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

  return (
    <>
      <div className="border border-secondary-200 bg-white">
        <div className="border-b border-secondary-200 bg-secondary-100 px-4 py-2">
          <Title variant="secondarySemibold" size="lg">
            Inquiry List
          </Title>
        </div>

        {/* Table */}
        <div className="p-4">
          <div className="overflow-x-auto border-b border-secondary-200">
            <table className="table bg-white text-base">
              <thead>
                <tr className="border-b-2 border-secondary-200 text-base text-primary-500">
                  <th className="w-10">No</th>
                  <th className="min-w-[150px]">Name</th>
                  <th className="min-w-[200px]">Job Type</th>
                  <th className="min-w-[130px]">Status</th>
                  <th className="w-full">Message</th>
                  <th className="min-w-[150px]">Action</th>
                </tr>
              </thead>
              {loading ? (
                <tbody>
                  <tr>
                    <td colSpan="6" className="h-[400px] text-center">
                      <span className="loading loading-bars loading-lg"></span>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {currentInquiries.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center capitalize">
                        <img
                          src={NoData}
                          alt="No data"
                          className="mx-auto h-[250px]"
                        />
                        No inquiry found
                      </td>
                    </tr>
                  ) : (
                    currentInquiries.map((inquiry, index) => (
                      <tr
                        key={inquiry.id || index}
                        className="text-sm hover:bg-secondary-50"
                      >
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="uppercase">
                          {inquiry.clientFirstName} {inquiry.clientLastName}
                        </td>
                        <td className="uppercase">{inquiry.jobType}</td>
                        <td>
                          <div className="flex font-semibold">
                            <Chip
                              variant="ghost"
                              color={statusColors[inquiry.inquiryStatus]}
                              value={
                                <Typography
                                  variant="small"
                                  className="font-bold capitalize leading-none"
                                >
                                  {inquiry.inquiryStatus}
                                </Typography>
                              }
                            />
                          </div>
                        </td>
                        <td>{inquiry.clientMessage || "N/A"}</td>
                        <td className="flex items-center justify-end gap-3">
                          <div className="flex gap-3">
                            {/* Form Received Button */}
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
                                  onClick={() => handleFormReceived(inquiry)}
                                >
                                  <TbChecklist className="text-[20px]" />
                                </Button>
                              </Tooltip>
                            )}
                            {/* Set Inspection and Send Quotation Button */}
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
                                    onClick={() => openInspection(inquiry)}
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
                                    onClick={() => openQuotation(inquiry)}
                                  >
                                    <TbFilePlus className="text-[20px]" />
                                  </Button>
                                </Tooltip>
                              </>
                            )}
                            {/* View Details Button */}
                            <Tooltip
                              content="View Details "
                              className="!bg-opacity-60"
                              placement="left"
                              animate={{
                                mount: { scale: 1, y: 0 },
                                unmount: { scale: 0, y: 25 },
                              }}
                            >
                              <Button
                                className="!bg-blue-500 !p-1"
                                onClick={() => handleOpenViewModal(inquiry)}
                              >
                                <TbEye className="text-[20px]" />
                              </Button>
                            </Tooltip>
                            {/* Delete Inquiry Button */}
                            <Tooltip
                              content="Delete Inquiry"
                              className="!bg-opacity-60"
                              placement="left"
                              animate={{
                                mount: { scale: 1, y: 0 },
                                unmount: { scale: 0, y: 25 },
                              }}
                            >
                              <Button
                                className="!bg-red-500 !p-1"
                                onClick={() => handleDelete(inquiry)}
                              >
                                <TbTrash className="text-[20px]" />
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              )}
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="my-4 flex justify-center gap-8">
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
      </div>

      {/* Quotation Modal */}
      {openQuotationModal && (
        <>
          <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20">
            <div className="animate-fade-down animate-duration-[400ms] animate-ease-out">
              <div className="max-w-[500px]">
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
                  <div className="flex gap-2">
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
        </>
      )}

      {/* Inspection Modal */}
      {openInspectionModal && (
        <>
          <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20">
            <div className="animate-fade-down animate-duration-[400ms] animate-ease-out">
              <div className="w-[400px] max-w-[500px]">
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
        </>
      )}

      {/* View Details Modal */}
      {openViewModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20">
          <div className="animate-fade-down animate-duration-[400ms] animate-ease-out">
            <div className="max-w-[500px]">
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
                    <div className="flex gap-2">
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
