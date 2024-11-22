import React, { useState, useEffect } from "react";
import { Title } from "../props/Title";
import NoData from "../../assets/undraw_No_data_re_kwbl.png";
import {
  TbChevronLeft,
  TbChevronRight,
  TbEdit,
  TbPlus,
  TbTrash,
  TbX,
} from "react-icons/tb";
import {
  Button,
  Input,
  Option,
  Select,
  Textarea,
  Tooltip,
} from "@material-tailwind/react";
import Swal from "sweetalert2";

const ServicesTable = () => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [viewImageModal, setViewImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editService, setEditService] = useState(null);
  const [imageService, setImageService] = useState(null);
  const [serviceName, setServiceName] = useState("");
  const [jobType, setJobType] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setLoading(true);

    const sampleServices = [
      {
        serviceName: "Fits-outs (Painting, Carpentry, Masonry)",
        jobType: "Repairs",
        image: "https://via.placeholder.com/500",
        description:
          "We have been offering professional services such as painting, carpentry and masonry. Our team of experts will handle every aspect of your fits-out project, from start to finish.",
      },
    ];

    // Simulate loading (remove this if using a real API)
    setTimeout(() => {
      setLoading(false);
    }, 500);

    setServices(sampleServices);
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(services.length / rowsPerPage));
  }, [services, rowsPerPage]);

  const paginatedServices = services.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const openImageModal = (image) => {
    setSelectedImages([image]);
    setCurrentImageIndex(0);
    setViewImageModal(true);
  };

  const closeImageModal = () => {
    setSelectedImages([]);
    setViewImageModal(false);
  };

  const handleDeleteService = (index) => {
    Swal.fire({
      title: "Are you sure you want to delete this service?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleted!",
          text: "Service has been deleted.",
          confirmButtonText: "OK",
          icon: "success",
        }).then(() => {
          window.location.reload();
        });
      }
    });
  };

  const handleEditService = (service) => {
    setEditService(service);
    setServiceName(service.serviceName);
    setJobType(service.jobType);
    setDescription(service.description);
    setImageService(service.image);
  };

  const handleCloseEditService = () => {
    setEditService(null);
    setServiceName("");
    setImageService(null);
  };

  const handleUpdateService = () => {
    if (!serviceName || !jobType || !description || !imageService) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "All fields are required",
        confirmButtonText: "OK",
      });
      return;
    }

    const updatedServices = services.map((service) => {
      if (service.id === editService.id) {
        return {
          ...service,
          serviceName,
          jobType,
          description,
          image: imageService,
        };
      }
      return service;
    });

    setServices(updatedServices);
    setEditService(null);
    setServiceName("");
    setImageService(null);

    Swal.fire({
      title: "Are you sure you want to update this service?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Updated!",
          text: "Service has been updated.",
          confirmButtonText: "OK",
          icon: "success",
        }).then(() => {
          window.location.reload();
        });
      }
    });
  };

  return (
    <>
      <div className="border border-secondary-200">
        <div className="border-b border-secondary-200 bg-secondary-100 px-4 py-2">
          <Title variant="secondarySemibold" size="lg">
            Service List
          </Title>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="table bg-white text-base">
              <thead>
                <tr className="border-b-2 border-secondary-200 text-base text-primary-500">
                  <th className="w-10">No</th>
                  <th className="min-w-[300px]">Service Name</th>
                  <th className="min-w-[120px]">Image</th>
                  <th className="w-full">Description</th>
                  <th className="min-w-[150px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="h-[400px] text-center">
                      <span className="loading loading-bars loading-lg"></span>
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center capitalize">
                      <img
                        src={NoData}
                        alt="No data"
                        className="mx-auto h-[250px]"
                      />
                      No service data
                    </td>
                  </tr>
                ) : (
                  paginatedServices.map((service, index) => (
                    <tr
                      key={index}
                      className="text-sm capitalize hover:bg-secondary-50"
                    >
                      <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                      <td>{service.serviceName}</td>
                      <td>
                        <img
                          src={service.image}
                          alt="Service"
                          className="h-[50px] w-[50px] cursor-pointer"
                          onClick={() => openImageModal(service.image)}
                        />
                      </td>
                      <td>
                        <p className="line-clamp-6">{service.description}</p>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Tooltip
                            content="Edit Service"
                            className="!bg-opacity-60"
                            placement="left"
                            animate={{
                              mount: { scale: 1, y: 0 },
                              unmount: { scale: 0, y: 25 },
                            }}
                          >
                            <Button
                              className="!bg-blue-500 !p-1"
                              onClick={() => handleEditService(service)}
                            >
                              <TbEdit className="text-[20px]" />
                            </Button>
                          </Tooltip>
                          <Tooltip
                            content="Delete Service"
                            className="!bg-opacity-60"
                            placement="left"
                            animate={{
                              mount: { scale: 1, y: 0 },
                              unmount: { scale: 0, y: 25 },
                            }}
                          >
                            <Button
                              className="!bg-red-500 !p-1"
                              onClick={handleDeleteService}
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
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="mt-4 flex justify-center gap-8">
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

      {/* Edit Service Modal */}
      {editService && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20">
          <div className="animate-fade-down animate-duration-[400ms] animate-ease-out">
            <div className="flex items-center justify-between rounded-t-md border border-b-0 border-secondary-300 bg-secondary-100 px-4 py-2">
              <Title>Edit Service</Title>
              <div
                className="flex cursor-pointer items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
                onClick={handleCloseEditService}
              >
                <button>
                  <TbX />
                </button>
              </div>
            </div>
            <div className="flex min-w-[300px] flex-col gap-4 rounded-b-lg border border-secondary-300 bg-white p-4 md:min-w-[500px]">
              <Input
                label="Service Name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
              {/* Choose Job Type to add the service */}
              <Select
                label="Choose Job Type"
                value={jobType}
                onChange={setJobType}
              >
                <Option value="Repairs">Repairs</Option>
                <Option value="Renovation">Renovation</Option>
                <Option value="PMS">
                  Preventive Maintenance Service (PMS)
                </Option>
                <Option value="Cleaning Services">Cleaning Services</Option>
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button
                className="bg-secondary-950"
                onClick={handleUpdateService}
              >
                Update Service
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {viewImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="absolute inset-0" onClick={closeImageModal}></div>
          <div className="relative rounded-sm bg-white shadow-md">
            <button
              className="absolute right-2 top-2 rounded-full p-1 text-secondary-600 hover:bg-secondary-200 hover:text-secondary-800"
              onClick={closeImageModal}
            >
              <TbX className="text-[20px]" />
            </button>
            <div className="flex items-center gap-4">
              <img
                src={selectedImages[currentImageIndex]}
                alt="Selected"
                className="h-[300px] rounded-sm md:h-[400px]"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServicesTable;
