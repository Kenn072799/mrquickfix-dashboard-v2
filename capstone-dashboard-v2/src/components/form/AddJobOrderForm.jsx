import React, { useState } from "react";
import {
  Button,
  Checkbox,
  Input,
  List,
  ListItem,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { Title } from "../props/Title";
import { TbX } from "react-icons/tb";
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

const AddJobOrderForm = ({ onClose, adminId }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [quotationUploaded, setQuotationUploaded] = useState(false);
  const [inspectionDate, setInspectionDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [newJobOrder, setNewJobOrder] = useState({
    clientFirstName: "",
    clientLastName: "",
    clientAddress: "",
    clientEmail: "",
    clientPhone: "",
    jobType: "",
    jobServices: [],
    jobQuotation: "",
    jobStartDate: "",
    jobEndDate: "",
    jobInspectionDate: "",
    jobStatus: "",
    jobNotificationAlert: "",
    createdBy: adminId,
    updatedBy: adminId,
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setQuotationUploaded(!!file);
    setNewJobOrder((prev) => ({
      ...prev,
      jobQuotation: file ? file.name : "",
    }));
  };

  const handleSchedInspectionChange = (e) => {
    const date = e.target.value;
    setInspectionDate(date);
    setNewJobOrder((prev) => ({ ...prev, jobInspectionDate: date }));
  };

  const handleToggleOption = (option) => {
    setSelectedOptions((prev) => {
      const newOptions = prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option];
      setNewJobOrder((prev) => ({
        ...prev,
        jobServices: newOptions,
      }));
      return newOptions;
    });
  };

  const { createProject } = useJobOrderData();

  const handleAddJobOrder = async () => {
    if (
      newJobOrder.jobQuotation &&
      newJobOrder.jobStartDate &&
      newJobOrder.jobEndDate
    ) {
      newJobOrder.jobStatus = "in progress";
    } else if (newJobOrder.jobInspectionDate) {
      newJobOrder.jobStatus = "on process";
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please specify a start and end date, or provide an inspection date.",
      });
      return;
    }

    setLoading(true);

    const { success, message } = await createProject(newJobOrder);

    setLoading(false);

    if (!success) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: message,
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: message,
      });
      onClose();
    }
  };

  return (
    <div className="max-w-[500px]">
      <div className="flex cursor-pointer items-center justify-between rounded-t-md border border-b-0 border-secondary-300 bg-secondary-100 px-4 py-2">
        <Title>Add Job Order</Title>
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
        {/* Name */}
        <div className="flex gap-2">
          <Input
            value={newJobOrder.clientFirstName}
            label="First name"
            onChange={(e) =>
              setNewJobOrder({
                ...newJobOrder,
                clientFirstName: e.target.value,
              })
            }
          />
          <Input
            value={newJobOrder.clientLastName}
            label="Last name"
            onChange={(e) =>
              setNewJobOrder({ ...newJobOrder, clientLastName: e.target.value })
            }
          />
        </div>
        {/* Address */}
        <Input
          value={newJobOrder.clientAddress}
          label="Home address"
          onChange={(e) =>
            setNewJobOrder({ ...newJobOrder, clientAddress: e.target.value })
          }
        />
        {/* Email and Phone Number */}
        <div className="flex gap-2">
          <Input
            value={newJobOrder.clientEmail}
            label="Email address"
            onChange={(e) =>
              setNewJobOrder({ ...newJobOrder, clientEmail: e.target.value })
            }
          />
          <Input
            value={newJobOrder.clientPhone}
            label="Phone number"
            onChange={(e) =>
              setNewJobOrder({ ...newJobOrder, clientPhone: e.target.value })
            }
          />
        </div>
        {/* Select Type of Job */}
        <Select
          value={newJobOrder.jobType}
          label="Select Type of Job"
          onChange={(value) =>
            setNewJobOrder({ ...newJobOrder, jobType: value })
          }
        >
          <Option value="Repairs">Repairs</Option>
          <Option value="Renovation">Renovation</Option>
          <Option value="Preventive Maintenance Services">
            Preventive Maintenance Services
          </Option>
        </Select>
        {/* Select Services */}
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
        <div className="flex items-center text-sm font-semibold">
          <div className="my-2 h-[1px] w-full bg-secondary-200 text-sm"></div>
          <span className="whitespace-nowrap px-2">Scheduled project now</span>
          <div className="my-2 h-[1px] w-full bg-secondary-200 text-sm"></div>
        </div>
        {/* Upload Quotation File */}
        <Input
          type="file"
          label="Upload Quotation"
          className="!py-2"
          onChange={handleFileChange}
          disabled={inspectionDate}
        />
        {/* Start and End Date */}
        <div className="flex gap-2">
          <Input
            value={newJobOrder.jobStartDate}
            disabled={!quotationUploaded}
            type="date"
            label="Start Date"
            onChange={(e) =>
              setNewJobOrder({ ...newJobOrder, jobStartDate: e.target.value })
            }
          />
          <Input
            value={newJobOrder.jobEndDate}
            disabled={!quotationUploaded}
            type="date"
            label="End Date"
            onChange={(e) =>
              setNewJobOrder({ ...newJobOrder, jobEndDate: e.target.value })
            }
          />
        </div>
        <div className="flex items-center text-sm font-semibold">
          <div className="my-2 h-[1px] w-full bg-secondary-200 text-sm"></div>
          <span className="whitespace-nowrap px-2">
            Scheduled inspection first
          </span>
          <div className="my-2 h-[1px] w-full bg-secondary-200 text-sm"></div>
        </div>
        {/* Inspection Date */}
        <Input
          value={newJobOrder.jobInspectionDate}
          disabled={quotationUploaded}
          type="date"
          label="Inspection Date"
          onChange={handleSchedInspectionChange}
        />
        <Button
          className="!bg-primary-500"
          onClick={handleAddJobOrder}
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-dots loading-md"></span>
          ) : (
            "Add Job Order"
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddJobOrderForm;
