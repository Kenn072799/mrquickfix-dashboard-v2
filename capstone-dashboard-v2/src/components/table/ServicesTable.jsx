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
import { useServicesData } from "../../data/ServiceData";

const ImageChip = ({ image, onClick }) => (
  <div
    className="inline-flex cursor-pointer items-center rounded-full border border-secondary-200 bg-secondary-50 px-1 py-0.5 transition-colors duration-200 hover:bg-secondary-100"
    onClick={onClick}
  >
    <img
      src={image}
      alt="Service"
      className="h-8 w-8 rounded-full border-2 border-white object-cover"
      loading="lazy"
      decoding="async"
    />
  </div>
);

const ServicesTable = ({ refreshTrigger }) => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewImageModal, setViewImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editService, setEditService] = useState(null);
  const [formData, setFormData] = useState({
    serviceName: "",
    description: "",
    imageUrl: null,
    imageFile: null,
  });

  const rowsPerPage = 10;
  const totalPages = Math.ceil(services.length / rowsPerPage);

  const {
    fetchServiceData,
    removeServiceData,
    updateTextService,
    updateImageService,
  } = useServicesData();

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await fetchServiceData();
      setServices(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch services",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [refreshTrigger]);

  const paginatedServices = services.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setViewImageModal(true);
  };

  const handleEditService = (service) => {
    setEditService(service);
    setFormData({
      serviceName: service.serviceName,
      description: service.serviceDescription,
      imageUrl: service.serviceImageURL,
      imageFile: null,
    });
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (file) => {
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageUrl: URL.createObjectURL(file),
        imageFile: file,
      }));
    }
  };

  const handleUpdateService = async () => {
    const { serviceName, description, imageFile } = formData;

    if (!serviceName || !description) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "All fields are required",
      });
      return;
    }

    try {
      setLoading(true);

      if (imageFile) {
        const formData = new FormData();
        formData.append("serviceImage", imageFile);
        formData.append("serviceName", serviceName);
        formData.append("serviceDescription", description);

        await updateImageService(editService._id, formData);
      } else {
        await updateTextService(editService._id, {
          serviceName,
          serviceDescription: description,
        });
      }

      await fetchServices();
      handleCloseEdit();

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Service updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update service",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id) => {
    const result = await Swal.fire({
      title: "Delete Service",
      text: "Are you sure you want to delete this service?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await removeServiceData(id);
        await fetchServices();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Service has been deleted.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to delete service",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseEdit = () => {
    setEditService(null);
    setFormData({
      serviceName: "",
      description: "",
      imageUrl: null,
      imageFile: null,
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
          <div className="overflow-x-auto bg-white">
            <table className="min-w-full divide-y-2 divide-secondary-100 border-b border-secondary-100 text-sm">
              <thead className="text-left">
                <tr className="border-b-2 border-secondary-200 text-sm text-primary-500">
                  <th className="px-4 py-2">No</th>
                  <th className="px-4 py-2">Service Name</th>
                  <th className="px-4 py-2">Image</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="h-[400px] text-center">
                      <span className="loading loading-bars loading-lg bg-primary-500"></span>
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
                      className="bg-white text-sm capitalize hover:bg-secondary-50"
                    >
                      <td className="max-w-full px-4 py-2">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>
                      <td className="max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                        {service.serviceName}
                      </td>
                      <td className="min-w-[100px]">
                        <ImageChip
                          image={service.serviceImageURL}
                          onClick={() =>
                            handleImageClick(service.serviceImageURL)
                          }
                        />
                      </td>
                      <td className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                        <p className="line-clamp-6">
                          {service.serviceDescription}
                        </p>
                      </td>
                      <td className="flex justify-end gap-3 px-4 py-2 text-right">
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
                              onClick={() => handleDeleteService(service._id)}
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
                onClick={handleCloseEdit}
              >
                <button>
                  <TbX />
                </button>
              </div>
            </div>
            <div className="flex min-w-[300px] flex-col gap-4 rounded-b-lg border border-secondary-300 bg-white p-4 md:min-w-[500px]">
              <Input
                label="Service Name"
                value={formData.serviceName}
                onChange={(e) =>
                  handleFormChange("serviceName", e.target.value)
                }
              />
              <label className="text-sm">Upload Image:</label>
              <div className="flex items-center gap-4">
                {formData.imageUrl ? (
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg border">
                    <img
                      src={formData.imageUrl}
                      alt="Service"
                      className="h-full w-full object-cover"
                    />
                    <button
                      className="absolute right-0 top-0 m-1 rounded-full bg-black/20 p-1 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => handleFormChange("imageUrl", null)}
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
                      onChange={(e) => handleImageChange(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <Textarea
                label="Service Description"
                value={formData.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
              />
              <Button
                className="bg-secondary-950"
                onClick={handleUpdateService}
                disabled={
                  loading ||
                  (formData.serviceName === editService?.serviceName &&
                    formData.description === editService?.serviceDescription &&
                    !formData.imageFile)
                }
              >
                {loading ? (
                  <span className="loading loading-dots loading-sm h-1 py-2"></span>
                ) : (
                  "Update Service"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {viewImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur effect */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setViewImageModal(false)}
          />

          {/* Modal Content */}
          <div className="relative mx-4 w-full max-w-4xl animate-fade-up animate-duration-300">
            <div className="relative overflow-hidden rounded-lg bg-white shadow-2xl">
              {/* Header */}
              <div className="absolute left-0 right-0 top-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <h3 className="truncate font-medium text-white">
                    Service Image
                  </h3>
                  <button
                    className="rounded-full p-1.5 text-white transition-colors duration-200 hover:bg-white/20"
                    onClick={() => setViewImageModal(false)}
                  >
                    <TbX className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Image Container */}
              <div className="flex items-center justify-center bg-secondary-900/5">
                <img
                  src={selectedImage}
                  alt="Service Preview"
                  className="max-h-[80vh] w-auto object-contain"
                  style={{ maxWidth: "100%" }}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServicesTable;
