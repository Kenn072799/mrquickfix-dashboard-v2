import React, { useState } from "react";
import { Title } from "../props/Title";
import Logo from "../../assets/Mr.QuickFixLogo.webp";
import Swal from "sweetalert2";
import { Button } from "@material-tailwind/react";

const TestimonialForm = () => {
  const [testimonialMessage, setTestimonialMessage] = useState("");

  const handleSubmitFeedback = () => {
    if (!testimonialMessage) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill out the feedback form before submitting.",
        showConfirmButton: true,
        confirmButtonText: "OK",
      });
      return;
    }
    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Thank you for your feedback! We appreciate it.",
      showConfirmButton: true,
      confirmButtonText: "OK",
    }).then(() => {
      window.location.href = "/"; // Redirect to the home page of website
    });
  };

  return (
    <div className="my-16 flex items-center justify-center px-4">
      <div className="h-auto w-full max-w-[1200px] rounded-xl bg-white p-8 shadow-xl">
        <img
          src={Logo}
          alt="Logo"
          className="mx-auto mb-6 h-[40px] md:h-[50px]"
        />
        <div className="text-center">
          <Title variant="secondarySemibold" size="xl">
            We Value Your Feedback
          </Title>
        </div>
        <p className="mt-4 text-center text-sm text-secondary-600 md:text-base">
          Your thoughts help us improve. Please take a moment to share your
          experience with us. We’d love to hear how we did or how we can serve
          you better!
        </p>
        <div className="mt-6 flex flex-col gap-4">
          <textarea
            value={testimonialMessage}
            onChange={(e) => setTestimonialMessage(e.target.value)}
            placeholder="Write your feedback here..."
            className="h-[150px] w-full resize-none rounded-lg border border-gray-300 p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          ></textarea>
          <div className="flex justify-end">
            <Button className="bg-primary-500" onClick={handleSubmitFeedback}>
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialForm;
