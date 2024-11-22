import React, { useState } from "react";
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
  const [newService, setNewService] = useState({ serviceName: "" });

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
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleUploadProject = () => {
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

    console.log("Uploading Project with the following data:");
    console.log("Project Name:", newProject.projectName);
    console.log("Selected Services:", selectedOptions);
    console.log("Thumbnail:", thumbnail);
    console.log("Images:", images);

    Swal.fire({
      title: "Success",
      text: "Project uploaded successfully",
      icon: "success",
      confirmButtonText: "OK",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.reload();
      }
    });
  };

  const handleServiceClose = () => {
    setOpenAddService(false);
    setNewService({ serviceName: "" });
    setImageService(null);
  };

  const handleAddService = () => {
    if (!newService.serviceName || !imageService) {
      Swal.fire({
        title: "Error",
        text: "Please fill in all fields before adding the service.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    console.log("Adding Service with the following data:");
    console.log("Service Name:", newService.serviceName);
    console.log("Service Image:", imageService);

    Swal.fire({
      title: "Success",
      text: "Service added successfully",
      icon: "success",
      confirmButtonText: "OK",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.reload();
      }
    });
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
          <ServicesTable newService={newService} />
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
              {/* Thumbnail Upload */}
              <label className="text-sm">Upload Thumbnail:</label>
              <div className="flex items-center gap-4">
                {thumbnail ? (
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg border">
                    <img
                      src={thumbnail}
                      alt="Thumbnail"
                      className="h-full w-full object-cover"
                    />
                    <button
                      className="absolute right-0 top-0 m-1 rounded-full bg-black/20 p-1 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => setThumbnail(null)}
                    >
                      <TbX />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-gray-500 hover:border-gray-800">
                    <TbPlus size={24} />
                    <span className="text-xs">Add Thumbnail</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setThumbnail(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {/* Upload Project */}
              <label className="text-sm">Upload Project:</label>
              <div className="flex items-center gap-2">
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
                        className="absolute right-0 top-0 m-1 rounded-full bg-black/20 p-1 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => removeImage(index)}
                      >
                        <TbX />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-gray-500 hover:border-gray-800">
                  <TbPlus size={24} />
                  <span className="text-xs">Add Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <Button
                className="bg-secondary-950"
                onClick={handleUploadProject}
              >
                Upload Project
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
              <Select label="Choose Job Type">
                <Option>Repairs</Option>
                <Option>Renovation</Option>
                <Option>Preventive Maintenance Service (PMS)</Option>
                <Option>Cleaning Services</Option>
              </Select>
              <label className="text-sm">Upload Image:</label>
              <div className="flex items-center gap-4">
                {imageService ? (
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg border">
                    <img
                      src={imageService}
                      alt="Service"
                      className="h-full w-full object-cover"
                    />
                    <button
                      className="absolute right-0 top-0 m-1 rounded-full bg-black/20 p-1 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => setImageService(null)}
                    >
                      <TbX />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-gray-500 hover:border-gray-800">
                    <TbPlus size={24} />
                    <span className="text-xs">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setImageService(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
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
              <Button className="bg-secondary-950" onClick={handleAddService}>
                Add Service
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContentManagement;
