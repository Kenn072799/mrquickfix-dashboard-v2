import React, { useState, useEffect } from "react";
import { Title } from "../props/Title";
import NoData from "../../assets/undraw_No_data_re_kwbl.png";
import {
  TbArrowForward,
  TbChevronLeft,
  TbChevronRight,
  TbCircleCheck,
  TbSortAscending,
  TbSortDescending,
} from "react-icons/tb";
import { Button, Chip, Tooltip, Typography } from "@material-tailwind/react";
import Swal from "sweetalert2";
import { useTestimonialData } from "../../data/TestimonialData";
import useCapitalize from "../hooks/useCapitalize";

const TestimonialTable = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialUpdate, setTestimonialUpdate] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const { fetchTestimonialData } = useTestimonialData();

  const { capitalizeWords } = useCapitalize();
  const statusColors = {
    Published: "blue",
    Draft: "amber",
  };
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const data = await fetchTestimonialData();
        setTestimonials(data);
      } catch (error) {
        console.error("Error fetching testimonial:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, [fetchTestimonialData]);

  const getFilteredData = () => {
    return testimonials.filter((testimonial) =>
      `${testimonial.jobID?.clientFirstName} ${testimonial.jobID?.clientLastName} ${testimonial.feedbackMessage}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  };

  const totalPages = Math.ceil(getFilteredData().length / entriesToShow);

  useEffect(() => {
    setCurrentPage(1);
  }, [entriesToShow]);

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

  const getSortedData = () => {
    const filtered = getFilteredData();
    const sorted = [...filtered].sort((a, b) => {
      if (!sortConfig.key) return 0;

      let aValue, bValue;

      switch (sortConfig.key) {
        case "name":
          aValue = `${a.jobID?.clientFirstName} ${a.jobID?.clientLastName}`;
          bValue = `${b.jobID?.clientFirstName} ${b.jobID?.clientLastName}`;
          break;
        case "rating":
          aValue = a.rating;
          bValue = b.rating;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "feedback":
          aValue = a.feedbackMessage;
          bValue = b.feedbackMessage;
          break;
        default:
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    return sorted.slice(
      (currentPage - 1) * entriesToShow,
      currentPage * entriesToShow,
    );
  };

  const currentData = getSortedData();

  const { updateTestimonialStatus } = useTestimonialData();

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const result = await Swal.fire({
        title: `Do you want to ${newStatus === "Published" ? "publish" : "unpublish"} this testimonial?`,
        showCancelButton: true,
        confirmButtonText: `Yes, ${newStatus === "Published" ? "Publish" : "Unpublish"}`,
        icon: "question",
      });

      if (result.isConfirmed) {
        const updateTestimonial = {
          ...testimonialUpdate,
          status: newStatus,
        };

        const { success, message } = await updateTestimonialStatus(
          id,
          updateTestimonial,
        );

        if (!success) {
          Swal.fire("Oops...", message, "error");
        } else {
          setTestimonials((prevTestimonials) =>
            prevTestimonials.map((testimonial) =>
              testimonial._id === id
                ? { ...testimonial, status: newStatus }
                : testimonial,
            ),
          );

          Swal.fire(
            "Success!",
            `Testimonial ${newStatus === "Published" ? "published" : "unpublished"} successfully!`,
            "success",
          );
        }
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update testimonial status.", "error");
      console.error("Error updating testimonial:", error);
    }
  };

  const handlePublish = (id) => handleStatusUpdate(id, "Published");
  const handleUnPublish = (id) => handleStatusUpdate(id, "Draft");

  return (
    <div className="border border-secondary-200">
      <div className="border-b border-secondary-200 bg-secondary-100 px-4 py-2">
        <Title variant="secondarySemibold" size="lg">
          Testimonial List
        </Title>
      </div>

      {/* Table */}
      <div className="p-4">
        <div className="flex flex-col gap-4 pb-4 md:flex-row md:justify-between">
          {/* search bar */}
          <div className="flex items-center">
            <Title variant="secondarySemibold" size="sm">
              Search:
            </Title>
            <input
              className="mx-2 rounded-full border-secondary-200 bg-secondary-50 px-3 py-1 text-sm outline-none ring-secondary-600 focus:ring-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="name or feedback"
            />
          </div>

          {/* entries dropdown */}
          <div className="flex items-center">
            <Title variant="secondarySemibold" size="sm">
              Show:
            </Title>
            <select
              name="entries"
              id="entries"
              className="mx-2 rounded-sm border border-secondary-200 px-3 py-1 text-sm outline-none ring-secondary-600 focus:ring-2 md:text-base"
              value={entriesToShow}
              onChange={(e) => setEntriesToShow(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto bg-white">
          <table className="min-w-full divide-y-2 divide-secondary-100 border-b border-secondary-100 text-sm">
            <thead className="text-left">
              <tr className="border-b-2 border-secondary-200 text-sm text-primary-500">
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
                    sortConfig.key === "status" ? "bg-secondary-50" : ""
                  }`}
                  onClick={() => requestSort("status")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>Status</span>
                    {getSortDirection("status")}
                  </div>
                </th>
                <th
                  className={`group relative cursor-pointer px-4 py-2 hover:bg-secondary-50 ${
                    sortConfig.key === "rating" ? "bg-secondary-50" : ""
                  }`}
                  onClick={() => requestSort("rating")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>Rate</span>
                    {getSortDirection("rating")}
                  </div>
                </th>
                <th
                  className={`group relative cursor-pointer px-4 py-2 hover:bg-secondary-50 ${
                    sortConfig.key === "feedback" ? "bg-secondary-50" : ""
                  }`}
                  onClick={() => requestSort("feedback")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>Feedback</span>
                    {getSortDirection("feedback")}
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
              ) : currentData.length > 0 ? (
                currentData.map((testimonial, index) => (
                  <tr
                    key={testimonial._id}
                    className="bg-white text-sm capitalize hover:bg-secondary-50"
                  >
                    <td className="max-w-full px-4 py-2">
                      {index + 1 + (currentPage - 1) * entriesToShow}
                    </td>
                    <td className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                      {capitalizeWords(testimonial.jobID?.clientFirstName)}{" "}
                      {capitalizeWords(testimonial.jobID?.clientLastName)}
                    </td>
                    <td className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                      <div className="w-max">
                        <Chip
                          variant="ghost"
                          color={statusColors[testimonial.status]}
                          value={testimonial.status}
                        />
                      </div>
                    </td>
                    <td className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                      <div className="w-max">
                        <Chip
                          variant="ghost"
                          value={`${testimonial.rating} / 5`}
                        />
                      </div>
                    </td>
                    <td className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
                      {testimonial.feedbackMessage}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {testimonial.status === "Draft" ? (
                        <Tooltip
                          content="Publish"
                          className="!bg-opacity-60"
                          placement="left"
                          animate={{
                            mount: { scale: 1, y: 0 },
                            unmount: { scale: 0, y: 25 },
                          }}
                        >
                          <Button
                            className="!bg-blue-500 !p-1"
                            onClick={() => {
                              setTestimonialUpdate(testimonial);
                              handlePublish(testimonial._id);
                            }}
                          >
                            <TbCircleCheck className="text-[20px]" />
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip
                          content="Unpublish"
                          className="!bg-opacity-60"
                          placement="left"
                          animate={{
                            mount: { scale: 1, y: 0 },
                            unmount: { scale: 0, y: 25 },
                          }}
                        >
                          <Button
                            className="!bg-red-500 !p-1"
                            onClick={() => {
                              setTestimonialUpdate(testimonial);
                              handleUnPublish(testimonial._id);
                            }}
                          >
                            <TbArrowForward className="text-[20px]" />
                          </Button>
                        </Tooltip>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    <img
                      src={NoData}
                      alt="No data"
                      className="mx-auto h-[250px]"
                    />
                    No Testimonials Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="my-4 flex justify-center gap-8">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === totalPages}
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
  );
};

export default TestimonialTable;
