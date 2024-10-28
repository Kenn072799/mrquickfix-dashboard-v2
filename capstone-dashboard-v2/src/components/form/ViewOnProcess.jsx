import React, { useState, useEffect } from "react";
import { Title } from "../props/Title";
import {
  Button,
  Checkbox,
  Chip,
  Input,
  List,
  ListItem,
  Option,
  Select,
  Tooltip,
  Typography,
} from "@material-tailwind/react";
import {
  TbX,
  TbEdit,
  TbCheck,
  TbEditOff,
  TbFilePlus,
  TbFlagCheck,
  TbCalendarSearch,
} from "react-icons/tb";
import { useJobOrderData } from "../../data/JobOrderData";
import Swal from "sweetalert2";

const servicesList = [
  "Fits-outs",
  "Electrical Works",
  "Kitchen and Bath Renovation",
  "Aircon Services",
  "Door and Window Repairs",
  "Outdoor and Landscaping",
  "Household Cleaning Services",
];

const ViewOnProcess = ({ jobOrder, onClose }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [updatedProject, setUpdatedProject] = useState(jobOrder);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updateJobOrder } = useJobOrderData();

  useEffect(() => {
    setUpdatedProject(jobOrder);
    setSelectedOptions(jobOrder.jobServices || []);
    setHasUnsavedChanges(false);
  }, [jobOrder]);

  useEffect(() => {
    const isChanged =
      JSON.stringify(updatedProject) !== JSON.stringify(jobOrder);
    setHasUnsavedChanges(isChanged);
  }, [updatedProject, jobOrder]);

  const handleToggleOption = (option) => {
    setSelectedOptions((prev) => {
      const newOptions = prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option];

      setUpdatedProject((prev) => ({
        ...prev,
        jobServices: newOptions,
      }));

      return newOptions;
    });
  };

  const handleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setUpdatedProject(jobOrder);
    }
  };

  const showAlert = (icon, title, text) => {
    Swal.fire({
      icon,
      title,
      text,
    });
  };

  const handleUpdateProject = async () => {
    if (!updatedProject || !updatedProject._id) {
      showAlert("error", "Error", "Invalid project data");
      return;
    }

    const result = await Swal.fire({
      title: "Do you want to save the changes?",
      showCancelButton: true,
      confirmButtonText: "Save",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const { success, message } = await updateJobOrder(
          updatedProject._id,
          updatedProject,
        );
        setLoading(false);

        if (success) {
          showAlert("success", "Saved!", "Job order updated successfully!");
          onClose();
        } else {
          showAlert("error", "Oops...", message);
        }
      } catch (error) {
        setLoading(false);
        showAlert("error", "Error", "Failed to update job order.");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setUpdatedProject(jobOrder);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="relative max-w-[500px]">
      <div className="flex cursor-pointer items-center justify-between rounded-t-md border border-b-0 border-secondary-300 bg-secondary-100 px-4 py-2">
        <Title>
          Current Status:
          <span className="ml-1 capitalize">{jobOrder.jobStatus}</span>
        </Title>
        <div
          className="flex items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
          onClick={onClose}
        >
          <button>
            <TbX />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-b-md border border-secondary-300 bg-white p-4">
        <div className="flex justify-end">
          <div className="flex justify-end gap-2">
            {editMode ? (
              <>
                <Button
                  className="!flex !items-center !bg-red-500 !p-2 !shadow-none"
                  onClick={handleCancelEdit}
                >
                  Cancel edit
                  <TbEditOff className="ml-2 text-[16px]" />
                </Button>
                {hasUnsavedChanges && (
                  <Button
                    className="flex items-center bg-blue-500 !p-2 !shadow-none"
                    onClick={handleUpdateProject}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading loading-dots loading-md"></span>
                    ) : (
                      <>
                        Save changes
                        <TbCheck className="ml-2 text-[16px]" />
                      </>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <Button
                className="flex items-center bg-blue-500 !p-2 !shadow-none"
                onClick={handleEditMode}
              >
                Edit Details
                <TbEdit className="ml-2 text-[16px]" />
              </Button>
            )}
          </div>
        </div>

        {jobOrder.jobStatus === "on process" && (
          <>
            <div className="flex items-center text-sm font-semibold">
              <span className="whitespace-nowrap pr-2 text-red-400">
                Inspection Schedule
              </span>
              <div className="my-2 h-[1px] w-full bg-secondary-200 text-sm"></div>
            </div>
            <Input
              id="jobInspectionDate"
              type={editMode ? "date" : "text"}
              name="jobInspectionDate"
              label="Inspection Date"
              value={
                editMode
                  ? updatedProject.jobInspectionDate
                  : new Date(jobOrder.jobInspectionDate).toLocaleDateString(
                      "en-US",
                    )
              }
              onChange={(e) =>
                editMode &&
                setUpdatedProject({
                  ...updatedProject,
                  jobInspectionDate: e.target.value,
                })
              }
              readOnly={!editMode}
            />
          </>
        )}

        {jobOrder.jobStatus === "in progress" && (
          <>
            <div className="flex items-center text-sm font-semibold">
              <span className="whitespace-nowrap pr-2 text-red-400">
                Project Schedule
              </span>
              <div className="my-2 h-[1px] w-full bg-secondary-200"></div>
            </div>

            <div className="flex gap-2">
              <Input
                id="jobStartDate"
                type={editMode ? "date" : "text"}
                name="jobStartDate"
                label="Start Date"
                value={
                  editMode
                    ? updatedProject.jobStartDate
                    : new Date(jobOrder.jobStartDate).toLocaleDateString(
                        "en-US",
                      )
                }
                onChange={(e) =>
                  editMode &&
                  setUpdatedProject({
                    ...updatedProject,
                    jobStartDate: e.target.value,
                  })
                }
                readOnly={!editMode}
              />
              <Input
                id="jobEndDate"
                type={editMode ? "date" : "text"}
                name="jobEndDate"
                label="End Date"
                value={
                  editMode
                    ? updatedProject.jobEndDate
                    : new Date(jobOrder.jobEndDate).toLocaleDateString("en-US")
                }
                onChange={(e) =>
                  editMode &&
                  setUpdatedProject({
                    ...updatedProject,
                    jobEndDate: e.target.value,
                  })
                }
                readOnly={!editMode}
              />
            </div>
            {!editMode ? (
              <div>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={jobOrder.jobQuotation}
                  className="border border-gray-400 bg-gray-200 p-2 text-sm text-secondary-900 hover:bg-gray-300"
                >
                  View Quotation
                </a>
              </div>
            ) : (
              <Input
                id="jobQuotation"
                type="file"
                name="jobQuotation"
                label="Upload New Quotation"
                className="!py-2"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setUpdatedProject({
                      ...updatedProject,
                      jobQuotation: file,
                    });
                  }
                }}
              />
            )}
          </>
        )}

        <div className="flex items-center text-sm font-semibold">
          <span className="whitespace-nowrap pr-2 text-secondary-500">
            Client Information
          </span>
          <div className="my-2 h-[1px] w-full bg-secondary-200 text-sm"></div>
        </div>
        <div className="flex gap-2">
          <Input
            id="clientFirstName"
            name="clientFirstName"
            label="First name"
            value={
              editMode
                ? updatedProject.clientFirstName
                : jobOrder.clientFirstName
            }
            onChange={(e) =>
              editMode &&
              setUpdatedProject({
                ...updatedProject,
                clientFirstName: e.target.value,
              })
            }
            readOnly={!editMode}
          />
          <Input
            id="clientLastName"
            name="clientLastName"
            label="Last name"
            value={
              editMode ? updatedProject.clientLastName : jobOrder.clientLastName
            }
            onChange={(e) =>
              editMode &&
              setUpdatedProject({
                ...updatedProject,
                clientLastName: e.target.value,
              })
            }
            readOnly={!editMode}
          />
        </div>
        <Input
          id="clientAddress"
          name="clientAddress"
          label="Home address"
          value={
            editMode ? updatedProject.clientAddress : jobOrder.clientAddress
          }
          onChange={(e) =>
            editMode &&
            setUpdatedProject({
              ...updatedProject,
              clientAddress: e.target.value,
            })
          }
          readOnly={!editMode}
        />
        <div className="flex gap-2">
          <Input
            id="clientEmail"
            name="clientEmail"
            label="Email"
            value={editMode ? updatedProject.clientEmail : jobOrder.clientEmail}
            onChange={(e) =>
              editMode &&
              setUpdatedProject({
                ...updatedProject,
                clientEmail: e.target.value,
              })
            }
            readOnly={!editMode}
          />
          <Input
            id="clientPhone"
            name="clientPhone"
            label="Phone number"
            value={editMode ? updatedProject.clientPhone : jobOrder.clientPhone}
            onChange={(e) =>
              editMode &&
              setUpdatedProject({
                ...updatedProject,
                clientPhone: e.target.value,
              })
            }
            readOnly={!editMode}
          />
        </div>
        <div className="flex items-center text-sm font-semibold">
          <span className="whitespace-nowrap pr-2 text-secondary-500">
            Job Order Information
          </span>
          <div className="my-2 h-[1px] w-full bg-secondary-200 text-sm"></div>
        </div>
        {!editMode ? (
          <Input
            id="jobType"
            name="jobType"
            label="Type of job"
            value={jobOrder.jobType}
            readOnly
          />
        ) : (
          <Select
            label="Select Type of Job"
            value={updatedProject.jobType}
            onChange={(value) =>
              setUpdatedProject({
                ...updatedProject,
                jobType: value,
              })
            }
          >
            <Option value="Repairs">Repairs</Option>
            <Option value="Renovation">Renovation</Option>
            <Option value="Preventive Maintenance Services">
              Preventive Maintenance Services
            </Option>
          </Select>
        )}

        {!editMode ? (
          <Input
            id="jobServices"
            name="jobServices"
            label="Selected Services"
            value={jobOrder.jobServices.join(", ")}
            readOnly
          />
        ) : (
          <>
            <label className="text-sm">Select Services:</label>
            <div className="max-h-[104px] overflow-y-auto rounded border">
              <List className="flex-col">
                {servicesList.map((service, index) => (
                  <ListItem key={index} className="p-0">
                    <label
                      htmlFor={`service-checkbox-${index}`}
                      className="flex w-full cursor-pointer items-center"
                    >
                      <Checkbox
                        id={`service-checkbox-${index}`}
                        checked={selectedOptions.includes(service)}
                        onChange={() => handleToggleOption(service)}
                      />
                      <Typography variant="small">{service}</Typography>
                    </label>
                  </ListItem>
                ))}
              </List>
            </div>
          </>
        )}

        <div className="my-1 h-[1px] w-full bg-secondary-200 text-sm"></div>
        <div className="flex flex-col">
          <div className="flex justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-secondary-900">
                Created By: <span className="capitalize">Kenneth Altes</span>
              </span>
              <span className="text-xs text-secondary-500">
                {new Date(jobOrder.createdAt).toLocaleString()}
              </span>
            </div>

            {jobOrder.updatedAt !== jobOrder.createdAt && (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-secondary-900">
                  Updated By: <span className="capitalize">Kenneth Altes</span>
                </span>
                <span className="text-xs text-secondary-500">
                  {new Date(jobOrder.updatedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOnProcess;
