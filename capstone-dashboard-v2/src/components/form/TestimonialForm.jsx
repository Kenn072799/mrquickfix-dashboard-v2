import React, { useState } from "react";
import { Title } from "../props/Title";
import { useParams } from "react-router-dom";
import Logo from "../../assets/Mr.QuickFixLogo.webp";
import Swal from "sweetalert2";
import { Button } from "@material-tailwind/react";
import { useTestimonialData } from "../../data/TestimonialData";
import { FaStar } from "react-icons/fa";

const TestimonialForm = () => {
  const [data, setData] = useState({
    feedbackMessage: "",
    rating: 0,
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const { createTestimonial } = useTestimonialData();

  const handleSubmitFeedback = async () => {
    if (!data.feedbackMessage) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill out the feedback form before submitting.",
        showConfirmButton: true,
        confirmButtonText: "OK",
      });
      return;
    }

    if (data.rating === 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please provide a rating before submitting.",
        showConfirmButton: true,
        confirmButtonText: "OK",
      });
      return;
    }

    setLoading(true);
    const id = params.id;
    const { success, message } = await createTestimonial(id, data);
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
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Thank you",
            text: "Do you want to visit our website?",
            showCancelButton: true,
            confirmButtonText: "Yes",
            icon: "question",
          }).then(async (finalResult) => {
            if (finalResult.isConfirmed) {
              window.location.href = "http://localhost:5174/";
            }
          });
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* Header */}
          <div className="bg-primary-500 px-6 py-8">
            <div className="flex items-center justify-center">
              <div className="inline-block rounded-full bg-white p-4">
                <img
                  src={Logo}
                  alt="Logo"
                  className="mx-auto h-[40px] md:h-[50px]"
                />
              </div>
            </div>
            <div className="mt-6 text-center">
              <Title variant="white" size="xl">
                We Value Your Feedback
              </Title>
              <p className="mt-2 text-white/80">
                Your thoughts help us improve our services
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 py-8">
            {/* Rating Section */}
            <div className="mb-8">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                How would you rate our service?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="transition-transform hover:scale-110 focus:outline-none"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setData({ ...data, rating: star })}
                  >
                    <FaStar
                      className={`text-2xl ${
                        star <= (hoveredRating || data.rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Message */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Share your experience with us
              </label>
              <textarea
                value={data.feedbackMessage}
                onChange={(e) =>
                  setData({ ...data, feedbackMessage: e.target.value })
                }
                placeholder="Tell us what you liked and how we can improve..."
                className="h-[150px] w-full resize-none rounded-lg border border-gray-300 p-4 text-sm text-gray-700 placeholder-gray-400 transition duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
              <Button
                className="rounded-lg bg-primary-500 px-6 py-2 text-white transition duration-200 hover:bg-primary-600 disabled:opacity-50"
                onClick={handleSubmitFeedback}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 text-center text-sm text-gray-500">
            Thank you for helping us improve our services!
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialForm;
