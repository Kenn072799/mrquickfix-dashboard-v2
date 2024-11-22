import React, { useState, useEffect } from "react";
import { Title } from "../props/Title";
import NoData from "../../assets/undraw_No_data_re_kwbl.png";
import {
  TbArrowForward,
  TbChevronLeft,
  TbChevronRight,
  TbCircleCheck,
} from "react-icons/tb";
import { Button, Chip, Tooltip, Typography } from "@material-tailwind/react";
import Swal from "sweetalert2";

const TestimonialTable = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const rowsPerPage = 10;

  const statusColors = {
    Published: "blue",
    Draft: "amber",
  };

  useEffect(() => {
    setLoading(true);
    const testimonialsData = [
      {
        id: 1,
        clientFirstName: "Kenneth",
        clientLastName: "Altes",
        testimonialStatus: "Published",
        testimonialMessage: "This service is amazing! Highly recommended.",
      },
      {
        id: 2,
        clientFirstName: "Angelica",
        clientLastName: "Ragub",
        testimonialStatus: "Draft",
        testimonialMessage:
          "Worst service ever! Do not inquire. You will regret it.",
      },
      {
        id: 3,
        clientFirstName: "Kenneth",
        clientLastName: "Altes",
        testimonialStatus: "Published",
        testimonialMessage: "Great experience overall, thank you!",
      },
    ];

    // Simulate loading (remove this if using a real API)
    setTimeout(() => {
      setLoading(false);
    }, 500);

    setTestimonials(testimonialsData);
  }, []);

  const totalPages = Math.ceil(testimonials.length / rowsPerPage);

  const currentData = testimonials.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handlePublish = (id) => {
    Swal.fire({
      title: "Are you sure you want to publish this testimonial?",
      icon: "warning",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Success",
          text: "Testimonial published successfully",
          icon: "success",
          confirmButtonText: "OK",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      }
    });
  };

  const handleUnPublish = (id) => {
    Swal.fire({
      title: "Are you sure you want to unpublish this testimonial?",
      icon: "warning",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Success",
          text: "Testimonial unpublished successfully",
          icon: "success",
          confirmButtonText: "OK",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      }
    });
  };

  return (
    <div className="border border-secondary-200">
      <div className="border-b border-secondary-200 bg-secondary-100 px-4 py-2">
        <Title variant="secondarySemibold" size="lg">
          Testimonial List
        </Title>
      </div>

      {/* Table */}
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="table border-b bg-white text-base">
            <thead>
              <tr className="border-b-2 border-secondary-200 text-base text-primary-500">
                <th className="w-10">No</th>
                <th className="min-w-[150px]">Name</th>
                <th className="min-w-[130px]">Status</th>
                <th className="w-full">Feedback</th>
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
              ) : currentData.length > 0 ? (
                currentData.map((testimonial, index) => (
                  <tr
                    key={testimonial.id}
                    className="text-sm capitalize hover:bg-secondary-50"
                  >
                    <td>{index + 1 + (currentPage - 1) * rowsPerPage}</td>
                    <td>
                      {testimonial.clientFirstName} {testimonial.clientLastName}
                    </td>
                    <td>
                      {" "}
                      <div className="flex font-semibold">
                        <Chip
                          variant="ghost"
                          color={statusColors[testimonial.testimonialStatus]}
                          value={
                            <Typography
                              variant="small"
                              className="font-bold capitalize leading-none"
                            >
                              {testimonial.testimonialStatus}
                            </Typography>
                          }
                        />
                      </div>
                    </td>
                    <td>{testimonial.testimonialMessage}</td>
                    <td>
                      {testimonial.testimonialStatus === "Draft" ? (
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
                            onClick={() => handlePublish(testimonial.id)}
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
                            onClick={() => handleUnPublish(testimonial.id)}
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
                  <td colSpan="5" className="text-center">
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
