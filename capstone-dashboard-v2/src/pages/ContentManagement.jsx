import React, { useEffect, useState } from "react";
import { Title } from "../components/props/Title";
import ProjectTable from "../components/table/ProjectTable";
import { TbPlus, TbUpload, TbX } from "react-icons/tb";
import { Button as ButtonProps } from "../components/props/button";
import ServicesTable from "../components/table/ServicesTable";
import {
  Button,
  Input,
  Option,
  Select,
  Textarea,
} from "@material-tailwind/react";
import { List, ListItem, Checkbox, Typography } from "@material-tailwind/react";
import Swal from "sweetalert2";
import TestimonialTable from "../components/table/TestimonialTable";

import { useServicesData } from "../data/ServiceData";
import { useProjectData } from "../data/ProjectData";

const ContentManagement = () => {
  const [openProject, setOpenProject] = useState(false);
  const [newProject, setNewProject] = useState({
    projectName: "",
    services: [],
  });
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [images, setImages] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [openAddService, setOpenAddService] = useState(false);
  const [imageService, setImageService] = useState(null);
  const [AImage, setAImage] = useState([]);

  const [servicePhoto, setServicePhoto] = useState(null);
  const [newService, setNewService] = useState({
    serviceName: "",
    description: "",
  });
  const [selectedJobType, setSelectedJobType] = useState("");
  const [refreshServices, setRefreshServices] = useState(0);
  const [isServiceLoading, setIsServiceLoading] = useState(false);
  const [totalSize, setTotalSize] = useState(0);
  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
  const [serviceImageSize, setServiceImageSize] = useState(0);

  useEffect(() => {
    document.title = "Mr. Quick Fix | Content Management";
    window.scrollTo(0, 0);
  }, []);

  const servicesList = [
    "Fits-outs (Painting, Carpentry, Masonry)",
    "Door and Window Repairs",
    "Electrical Works",
    "Kitchen and Bath Renovation",
    "Outdoor and Landscaping",
    "Aircon Services",
    "Household Cleaning Services",
  ];

  const handleToggleOption = (service) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.includes(service)
        ? prevSelected.filter((option) => option !== service)
        : [...prevSelected, service],
    );
  };

  const handleProjectClose = () => {
    setOpenProject(false);
    setNewProject({ projectName: "" });
    setSelectedOptions([]);
    setImages([]);
    setThumbnail(null);
    setAImage([]);
    setTotalSize(0);
  };

  const validateFileSize = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      Swal.fire({
        title: "File Too Large",
        text: `File ${file.name} exceeds 10MB limit`,
        icon: "error",
        confirmButtonText: "OK",
      });
      return false;
    }
    return true;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentTotal =
      files.reduce((sum, file) => sum + file.size, 0) +
      (AImage.reduce((sum, file) => sum + file.size, 0) || 0);

    if (AImage.length + files.length > MAX_FILES) {
      Swal.fire({
        title: "Too Many Files",
        text: `Maximum ${MAX_FILES} images allowed`,
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const validFiles = files.filter(validateFileSize);
    if (validFiles.length === 0) return;

    if (currentTotal > MAX_TOTAL_SIZE) {
      Swal.fire({
        title: "Total Size Too Large",
        text: "Total upload size exceeds 50MB limit",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const newImages = validFiles.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...newImages]);
    setAImage((prev) => [...prev, ...validFiles]);
    setTotalSize(currentTotal);
  };

  const removeImage = (index) => {
    setTotalSize((prev) => prev - AImage[index].size);
    setAImage((prev) => prev.filter((_, i) => i !== index));
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };
  const { uploadProject, isLoading } = useProjectData();

  const handleUploadProject = async () => {
    if (
      !newProject.projectName ||
      selectedOptions.length === 0 ||
      !thumbnail ||
      images.length === 0
    ) {
      Swal.fire({
        title: "Error",
        text: "Please fill in all fields before uploading the project.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const newProjectUpload = new FormData();
    newProjectUpload.append("projectName", newProject.projectName);

    if (thumbnail.startsWith("data:image")) {
      const response = await fetch(thumbnail);
      const blob = await response.blob();
      newProjectUpload.append("projectThumbnail", blob, "thumbnail.jpg");
    }

    for (let service of selectedOptions) {
      newProjectUpload.append("projectServices", service);
    }

    for (let image of AImage) {
      newProjectUpload.append("projectImage", image);
    }

    try {
      const result = await uploadProject(newProjectUpload);

      if (!result.success) {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: result.message,
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: result.message,
          showConfirmButton: false,
          timer: 1500,
        });
        handleProjectClose();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to upload project",
      });
    }
  };

  const handleServiceClose = () => {
    setOpenAddService(false);
    setNewService({
      serviceName: "",
      description: "",
    });
    setImageService(null);
    setServicePhoto(null);
    setSelectedJobType("");
    setServiceImageSize(0);
  };

  const { AddProject } = useServicesData();

  const handleAddService = async () => {
    if (
      !newService.serviceName ||
      !imageService ||
      !selectedJobType ||
      !newService.description
    ) {
      Swal.fire({
        title: "Error",
        text: "Please fill in all fields before adding the service.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const newServices = new FormData();
    newServices.append("serviceName", newService.serviceName);
    newServices.append("typeofJob", selectedJobType);
    newServices.append("serviceImage", servicePhoto);
    newServices.append("serviceDescription", newService.description);

    try {
      setIsServiceLoading(true);
      const { success, message } = await AddProject(newServices);

      if (success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: message,
          timer: 1500,
          showConfirmButton: false,
        });
        handleServiceClose();
        setRefreshServices((prev) => prev + 1);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to add service",
      });
    } finally {
      setIsServiceLoading(false);
    }
  };

  const handleServiceImageUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Check file size
    if (!validateFileSize(file)) return;

    setImageService(URL.createObjectURL(file));
    setServicePhoto(file);
    setServiceImageSize(file.size);
  };

  return (
    <>
      <div className="mt-16 min-h-[calc(100vh-64px)] p-4 lg:p-8">
        <Title variant="secondaryBold" size="xxxl">
          Content Management
        </Title>
        {/* Project Table */}
        <div className="flex max-w-[150px] py-4">
          <ButtonProps onClick={() => setOpenProject(true)}>
            <TbUpload className="mr-2 text-[18px]" /> Upload Project
          </ButtonProps>
        </div>
        <div className="bg-white">
          <ProjectTable />
        </div>

        {/* Services Table */}
        <div className="flex max-w-[170px] py-4">
          <ButtonProps onClick={() => setOpenAddService(true)}>
            <TbPlus className="mr-2 text-[18px]" /> Add New Services
          </ButtonProps>
        </div>
        <div className="bg-white">
          <ServicesTable
            newService={newService}
            refreshTrigger={refreshServices}
          />
        </div>

        {/* Testimonial Table */}
        <div className="mt-4 bg-white">
          <TestimonialTable />
        </div>
      </div>

      {/* --------------------- Upload Project Modal --------------------- */}
      {openProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20">
          <div className="animate-fade-down animate-duration-[400ms] animate-ease-out">
            <div className="flex items-center justify-between rounded-t-md border border-b-0 border-secondary-300 bg-secondary-100 px-4 py-2">
              <Title>Upload Project</Title>
              <div
                className="flex cursor-pointer items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
                onClick={handleProjectClose}
              >
                <button>
                  <TbX />
                </button>
              </div>
            </div>
            <div className="flex min-w-[300px] flex-col gap-4 rounded-b-lg border border-secondary-300 bg-white p-4 md:min-w-[500px]">
              <Input
                label="Project Name"
                value={newProject.projectName}
                onChange={(e) =>
                  setNewProject({ ...newProject, projectName: e.target.value })
                }
              />
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
              {/* Project Images Upload Section */}
              <div className="space-y-2">
                <label className="text-sm">Upload Project Images:</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Limits:</span>
                    <span
                      className={
                        images.length === MAX_FILES ? "text-red-500" : ""
                      }
                    >
                      {images.length}/{MAX_FILES} files
                    </span>
                    <span
                      className={
                        totalSize > MAX_TOTAL_SIZE ? "text-red-500" : ""
                      }
                    >
                      {(totalSize / (1024 * 1024)).toFixed(1)}/50 MB
                    </span>
                  </div>
                  <div className="flex max-h-[90px] max-w-[150px] flex-wrap gap-2 overflow-auto md:max-w-[350px]">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="relative h-24 w-24 overflow-hidden rounded-lg border"
                      >
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          className="absolute right-0 top-0 m-1 rounded-full bg-black/20 p-1 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                          onClick={() => removeImage(index)}
                        >
                          <TbX />
                        </button>
                      </div>
                    ))}
                    {images.length < MAX_FILES && (
                      <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-gray-500 transition-colors hover:border-gray-800">
                        <TbPlus size={24} />
                        <span className="text-xs">Add Images</span>
                        <span className="text-[10px] text-gray-400">
                          Max 10MB/file
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              {/* Thumbnail Upload Section */}
              <div className="space-y-2">
                <label className="text-sm">Upload Thumbnail:</label>
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-gray-500">Max size: 10MB</div>
                  <div className="flex items-center gap-4">
                    {thumbnail ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-lg border">
                        <img
                          src={thumbnail}
                          alt="Thumbnail"
                          className="h-full w-full object-cover"
                        />
                        <button
                          className="absolute right-0 top-0 m-1 rounded-full bg-black/20 p-1 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                          onClick={() => {
                            setThumbnail(null);
                          }}
                        >
                          <TbX />
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-gray-500 transition-colors hover:border-gray-800">
                        <TbPlus size={24} />
                        <span className="text-xs">Add Thumbnail</span>
                        <span className="text-[10px] text-gray-400">
                          Max 10MB
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file && validateFileSize(file)) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setThumbnail(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              {/* Upload Project */}
              <Button
                className="bg-secondary-950"
                onClick={handleUploadProject}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-dots loading-sm h-1 py-2"></span>
                ) : (
                  "Upload Project"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------- Add Service Modal --------------------- */}
      {openAddService && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20">
          <div className="animate-fade-down animate-duration-[400ms] animate-ease-out">
            <div className="flex items-center justify-between rounded-t-md border border-b-0 border-secondary-300 bg-secondary-100 px-4 py-2">
              <Title>Add Service</Title>
              <div
                className="flex cursor-pointer items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
                onClick={handleServiceClose}
              >
                <button>
                  <TbX />
                </button>
              </div>
            </div>
            <div className="flex min-w-[300px] flex-col gap-4 rounded-b-lg border border-secondary-300 bg-white p-4 md:min-w-[500px]">
              <Input
                label="Service Name"
                value={newService.serviceName}
                onChange={(e) =>
                  setNewService({ ...newService, serviceName: e.target.value })
                }
              />
              {/* Choose Job Type to add the service */}
              <Select
                label="Choose Job Type"
                value={selectedJobType}
                onChange={setSelectedJobType}
              >
                <Option value="Repairs">Repairs</Option>
                <Option value="Renovation">Renovation</Option>
                <Option value="Preventive Maintenance Service (PMS)">
                  Preventive Maintenance Service (PMS)
                </Option>
                <Option value="Cleaning Services">Cleaning Services</Option>
              </Select>
              {/* Service Image Upload Section */}
              <div className="space-y-2">
                <label className="text-sm">Upload Image:</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Size:</span>
                    <span className={serviceImageSize > MAX_FILE_SIZE ? "text-red-500" : ""}>
                      {(serviceImageSize / (1024 * 1024)).toFixed(1)}/10 MB
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {imageService ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-lg border">
                        <img
                          src={imageService}
                          alt="Service"
                          className="h-full w-full object-cover"
                        />
                        <button
                          className="absolute right-0 top-0 m-1 rounded-full bg-black/20 p-1 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                          onClick={() => {
                            setImageService(null);
                            setServicePhoto(null);
                            setServiceImageSize(0);
                          }}
                        >
                          <TbX />
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-gray-500 transition-colors hover:border-gray-800">
                        <TbPlus size={24} />
                        <span className="text-xs">Add Image</span>
                        <span className="text-[10px] text-gray-400">Max 10MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleServiceImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <Textarea
                label="Service Description"
                value={newService.description}
                onChange={(e) =>
                  setNewService({
                    ...newService,
                    description: e.target.value,
                  })
                }
              />
              <Button
                className="bg-secondary-950"
                onClick={handleAddService}
                disabled={isServiceLoading}
              >
                {isServiceLoading ? (
                  <span className="loading loading-dots loading-sm h-1 py-2"></span>
                ) : (
                  "Add Service"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContentManagement;
