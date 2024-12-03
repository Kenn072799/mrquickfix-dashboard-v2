import React, { useState, useEffect } from "react";
import { Title } from "../props/Title";
import NoData from "../../assets/undraw_No_data_re_kwbl.png";
import { TbChevronLeft, TbChevronRight, TbTrash, TbX } from "react-icons/tb";
import { Button, Tooltip } from "@material-tailwind/react";
import Swal from "sweetalert2";
import { useProjectData } from "../../data/ProjectData";

const ImageChip = ({ image, onClick, isFirst }) => (
  <div
    className={`inline-flex cursor-pointer items-center gap-1 rounded-full border border-secondary-200 bg-secondary-50 px-1 py-0.5 transition-colors duration-200 hover:bg-secondary-100 ${
      isFirst ? "" : "-ml-2"
    }`}
    onClick={onClick}
  >
    <img
      src={image}
      alt="Project"
      className="h-8 w-8 rounded-full border-2 border-white object-cover"
      loading="lazy"
      decoding="async"
    />
  </div>
);

const ProjectTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;
  const [viewImageModal, setViewImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    projects,
    isLoading,
    error,
    fetchProjects,
    removeProject,
    clearError,
  } = useProjectData();

  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchProjects();
      } catch (error) {
        console.error("Error fetching projects:", error);
        Swal.fire({
          icon: "error",
          title: "Failed to load projects",
          text: error.message,
        });
      }
    };
    initializeData();
  }, [fetchProjects]);

  useEffect(() => {
    const totalPagesCalculated = Math.ceil(projects.length / rowsPerPage);
    setTotalPages(Math.max(totalPagesCalculated, 1));
  }, [projects, rowsPerPage]);

  const openImageModal = (images) => {
    setSelectedImages(images);
    setCurrentImageIndex(0);
    setViewImageModal(true);
  };

  const handleDeleteProject = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Delete Project",
        text: "Are you sure you want to delete this project? This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc2626",
      });

      if (result.isConfirmed) {
        await removeProject(id);
        Swal.fire({
          icon: "success",
          title: "Project deleted successfully",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to delete project",
        text: error.message,
      });
    }
  };

  const closeImageModal = () => {
    setSelectedImages([]);
    setViewImageModal(false);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev < selectedImages.length - 1 ? prev + 1 : 0,
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : selectedImages.length - 1,
    );
  };

  useEffect(() => {
    return () => {
      if (error) clearError();
    };
  }, [error, clearError]);

  return (
    <>
      <div className="border border-secondary-200">
        <div className="border-b border-secondary-200 bg-secondary-100 px-4 py-2">
          <Title variant="secondarySemibold" size="lg">
            Project List
          </Title>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto bg-white">
            <table className="min-w-full divide-y-2 divide-secondary-100 border-b border-secondary-100 text-sm">
              <thead className="text-left">
                <tr className="border-b-2 border-secondary-200 text-sm text-primary-500">
                  <th className="px-4 py-2">No</th>
                  <th className="px-4 py-2">Project Name</th>
                  <th className="px-4 py-2">Services</th>
                  <th className="px-4 py-2">Thumbnail</th>
                  <th className="px-4 py-2">Images</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="h-[400px] text-center">
                      <span className="loading loading-bars loading-lg bg-primary-500"></span>
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center capitalize">
                      <img
                        src={NoData}
                        alt="No data"
                        className="mx-auto h-[250px]"
                      />
                      No project data
                    </td>
                  </tr>
                ) : (
                  projects
                    .slice(
                      (currentPage - 1) * rowsPerPage,
                      currentPage * rowsPerPage,
                    )
                    .map((project, index) => (
                      <tr
                        key={project._id}
                        className="bg-white text-sm capitalize hover:bg-secondary-50"
                      >
                        <td className="max-w-full px-4 py-2">
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </td>
                        <td className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                          {project.projectName}
                        </td>
                        <td className="max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                          {project.projectServices}
                        </td>
                        <td className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                          <div
                            className="inline-flex cursor-pointer items-center rounded-full border border-secondary-200 bg-secondary-50 px-1 py-0.5 transition-colors duration-200 hover:bg-secondary-100"
                            onClick={() =>
                              openImageModal([project.projectThumbnail])
                            }
                          >
                            <img
                              src={project.projectThumbnail}
                              alt="Thumbnail"
                              className="h-8 w-8 rounded-full border-2 border-white object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        </td>
                        <td className="min-w-[200px]">
                          <div className="flex items-center">
                            {project.projectImagesUrl
                              .slice(0, 3)
                              .map((image, idx) => (
                                <ImageChip
                                  key={idx}
                                  image={image}
                                  onClick={() =>
                                    openImageModal(project.projectImagesUrl)
                                  }
                                  isFirst={idx === 0}
                                />
                              ))}
                            {project.projectImagesUrl.length > 3 && (
                              <div
                                className="-ml-2 inline-flex cursor-pointer items-center rounded-full border border-secondary-200 bg-secondary-50 px-3 py-1 transition-colors duration-200 hover:bg-secondary-100"
                                onClick={() =>
                                  openImageModal(project.projectImagesUrl)
                                }
                              >
                                <span className="text-xs font-medium text-secondary-600">
                                  +{project.projectImagesUrl.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="flex justify-end gap-3 px-4 py-2 text-right">
                          <Tooltip
                            content="Delete Project"
                            className="!bg-opacity-60"
                            placement="left"
                            animate={{
                              mount: { scale: 1, y: 0 },
                              unmount: { scale: 0, y: 25 },
                            }}
                          >
                            <Button
                              className="!bg-red-500 !p-1 hover:!bg-red-600"
                              onClick={() => handleDeleteProject(project._id)}
                            >
                              <TbTrash className="text-[20px]" />
                            </Button>
                          </Tooltip>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {projects.length > 0 && (
            <div className="mt-4 flex justify-center gap-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="cursor-pointer disabled:opacity-50"
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
                className="cursor-pointer disabled:opacity-50"
              >
                <TbChevronRight className="text-secondary-500 hover:text-secondary-800" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {viewImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur effect */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeImageModal}
          />

          {/* Modal Content */}
          <div className="relative mx-4 w-full max-w-4xl animate-fade-up animate-duration-300">
            <div className="relative overflow-hidden rounded-lg bg-white shadow-2xl">
              {/* Header */}
              <div className="absolute left-0 right-0 top-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <h3 className="truncate font-medium text-white">
                    Project Image{" "}
                    {selectedImages.length > 1 &&
                      `(${currentImageIndex + 1}/${selectedImages.length})`}
                  </h3>
                  <button
                    className="rounded-full p-1.5 text-white transition-colors duration-200 hover:bg-white/20"
                    onClick={closeImageModal}
                  >
                    <TbX className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Image Container */}
              <div className="flex items-center justify-center bg-secondary-900/5">
                {selectedImages.length > 1 && (
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 rounded-full bg-black/20 p-2 text-white transition-colors duration-200 hover:bg-black/40"
                  >
                    <TbChevronLeft className="text-2xl" />
                  </button>
                )}

                <img
                  src={selectedImages[currentImageIndex]}
                  alt={`Project Image ${currentImageIndex + 1}`}
                  className="max-h-[80vh] w-auto object-contain"
                  style={{ maxWidth: "100%" }}
                  loading="lazy"
                  decoding="async"
                />

                {selectedImages.length > 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 rounded-full bg-black/20 p-2 text-white transition-colors duration-200 hover:bg-black/40"
                  >
                    <TbChevronRight className="text-2xl" />
                  </button>
                )}
              </div>

              {/* Image Counter for Mobile */}
              {selectedImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white md:hidden">
                  {currentImageIndex + 1}/{selectedImages.length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectTable;
