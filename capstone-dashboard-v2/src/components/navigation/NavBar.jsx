import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoNotificationsSharp } from "react-icons/io5";
import { MdKeyboardArrowDown, MdOutlineLogout } from "react-icons/md";
import { RiAccountCircleLine } from "react-icons/ri";
import DefaultImage from "../../assets/default.webp";
import { useAdminData } from "../../data/AdminData";
import { useJobOrderData } from "../../data/JobOrderData";
import useCurrentTime from "../hooks/useCurrentTime";
import Swal from "sweetalert2";
import useCapitalize from "../hooks/useCapitalize";
import { useTestimonialData } from "../../data/TestimonialData";

const NavBar = () => {
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [readNotifications, setReadNotifications] = useState(new Set());
  const [notificationLimit, setNotificationLimit] = useState(5);
  const { timeAgo } = useCurrentTime();
  const { capitalizeWords } = useCapitalize();
  const navigate = useNavigate();

  const { getLoggedInAdmin, admin, logoutAdmin } = useAdminData();
  const { fetchProjects, projects, updateNotificationRead } = useJobOrderData();
  const {
    fetchTestimonialData,
    testimonials,
    updateTestimonialNotificationRead,
  } = useTestimonialData();

  const handleLogout = async () => {
    try {
      const result = await Swal.fire({
        title: "Are you sure you want to log out?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, log out",
        cancelButtonText: "No, keep logged in",
      });

      if (result.isConfirmed) {
        await logoutAdmin();
        navigate("/login-admin");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleNotificationClick = () => {
    setOpenNotification(!openNotification);
    setOpenProfile(false);
  };

  const handleTestimonialNotificationClick = async (testimonialId) => {
    try {
      const updateResult =
        await updateTestimonialNotificationRead(testimonialId);
      if (!updateResult.success) {
        console.error(
          "Error updating testimonial notification:",
          updateResult.message,
        );
        return;
      }
      fetchTestimonialData();
    } catch (error) {
      console.error("Error updating testimonial notification:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
    getLoggedInAdmin();
    fetchTestimonialData();

    const interval = setInterval(() => {
      fetchProjects();
      fetchTestimonialData();
    }, 61000);
    return () => clearInterval(interval);
  }, [fetchProjects, getLoggedInAdmin, fetchTestimonialData]);

  useEffect(() => {
    if (projects.length === 0) return;

    const newReadNotifications = new Set(
      projects
        .filter(
          (project) =>
            project.jobNotificationRead && !readNotifications.has(project._id),
        )
        .map((project) => project._id),
    );
    if (newReadNotifications.size > 0) {
      setReadNotifications(
        (prev) => new Set([...prev, ...newReadNotifications]),
      );
    }
  }, [projects]);

  const unreadNotifications = projects
    .filter(
      (project) =>
        project.inquiryStatus === "pending" ||
        project.inquiryStatus === "received",
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getAllNotifications = () => {
    const jobNotifications = unreadNotifications.map((project) => ({
      ...project,
      type: "inquiry",
      date: new Date(project.createdAt),
    }));

    const testimonialNotifications =
      testimonials
        ?.filter((testimonial) => testimonial.status === "Draft")
        .map((testimonial) => ({
          ...testimonial,
          type: "testimonial",
          date: new Date(testimonial.createdAt),
        })) || [];

    return [...jobNotifications, ...testimonialNotifications]
      .sort((a, b) => b.date - a.date)
      .slice(0, notificationLimit);
  };

  const readNotificationsCount = [
    ...projects.filter(
      (project) =>
        project.inquiryStatus === "pending" &&
        project.jobNotificationRead === false,
    ),
    ...(testimonials?.filter(
      (testimonial) =>
        testimonial.status === "Draft" &&
        !testimonial.testimonialNotificationRead,
    ) || []),
  ];

  const handleSeeMore = () => {
    const totalNotifications =
      unreadNotifications.length +
      (testimonials?.filter((t) => t.status === "Draft").length || 0);
    setNotificationLimit(totalNotifications);
  };

  const NotificationDropdown = () => {
    const sortedNotifications = getAllNotifications();

    return (
      <div className="fixed right-0 top-16 z-30 h-[calc(100vh-64px)] w-full bg-white shadow-md md:absolute md:top-[51px] md:h-auto md:w-auto md:rounded-sm">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-lg font-bold text-secondary-900">Notifications</p>
          <button
            onClick={() => setOpenNotification(false)}
            className="text-secondary-600 hover:text-secondary-900 md:hidden"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[calc(100vh-130px)] w-full overflow-auto md:max-h-[300px] md:min-w-[300px]">
          {sortedNotifications.length > 0 ? (
            sortedNotifications.map((notification) => {
              if (notification.type === "inquiry") {
                const truncatedMessage =
                  notification.clientMessage?.length > 10
                    ? `${notification.clientMessage.slice(0, 10)}...`
                    : notification.clientMessage || "N/A";

                return (
                  <div
                    key={notification._id}
                    className={`relative flex flex-col px-4 py-3 text-secondary-600 hover:bg-secondary-100 md:px-3 md:py-2 ${
                      notification.jobNotificationRead
                        ? "bg-white"
                        : "bg-primary-50"
                    }`}
                    onClick={() => {
                      handleNotificationClick(notification._id);
                      setOpenNotification(false);
                    }}
                  >
                    <Link to="/track-job-orders">
                      <div className="flex flex-col">
                        <span className="flex gap-1 overflow-hidden whitespace-nowrap text-sm">
                          <span className="font-semibold">
                            {capitalizeWords(notification.clientFirstName)}
                          </span>{" "}
                          <span className="font-semibold">
                            {capitalizeWords(notification.clientLastName)}
                          </span>{" "}
                          has submitted an inquiry.
                        </span>
                        <span className="text-sm font-normal lowercase">
                          {truncatedMessage}
                        </span>
                        <span className="text-xs">
                          {timeAgo(notification.createdAt)} •{" "}
                          <span className="capitalize">
                            {notification.inquiryStatus}
                          </span>
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              } else {
                return (
                  <div
                    key={notification._id}
                    className={`relative flex flex-col px-4 py-3 text-secondary-600 hover:bg-secondary-100 md:px-3 md:py-2 ${
                      notification.testimonialNotificationRead
                        ? "bg-white"
                        : "bg-primary-50"
                    }`}
                    onClick={() => {
                      handleTestimonialNotificationClick(notification._id);
                      setOpenNotification(false);
                    }}
                  >
                    <Link to="/content-management">
                      <div className="flex flex-col">
                        <span className="flex gap-1 overflow-hidden whitespace-nowrap text-sm">
                          <span className="font-semibold">
                            {capitalizeWords(
                              notification.jobID?.clientFirstName,
                            )}
                          </span>{" "}
                          <span className="font-semibold">
                            {capitalizeWords(
                              notification.jobID?.clientLastName,
                            )}
                          </span>{" "}
                          has submitted a feedback.
                        </span>
                        <span className="text-sm font-normal">
                          Rating: {notification.rating}/5
                        </span>
                        <span className="text-xs">
                          {timeAgo(notification.createdAt)} • Draft
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              }
            })
          ) : (
            <div className="py-8 text-center text-secondary-400">
              No new notifications
            </div>
          )}
        </div>

        {unreadNotifications.length +
          (testimonials?.filter((t) => t.status === "Draft").length || 0) >
          notificationLimit && (
          <div className="p-2">
            <button
              onClick={handleSeeMore}
              className="w-full rounded-md border bg-secondary-100 py-2 text-center text-sm text-secondary-900 hover:bg-secondary-100/50"
            >
              See more
            </button>
          </div>
        )}
      </div>
    );
  };

  const ProfileDropdown = () => (
    <div className="absolute right-0 top-16 w-[150px] rounded-sm bg-white shadow-md">
      <div className="flex flex-col">
        <Link
          to="/my-profile"
          className="flex px-3 py-4 text-secondary-600 hover:bg-primary-50"
        >
          <RiAccountCircleLine className="mr-2 text-[22px] text-primary-500" />
          My Profile
        </Link>
        <button
          type="button"
          className="flex px-3 py-4 text-secondary-600 hover:bg-primary-50"
          onClick={handleLogout}
        >
          <MdOutlineLogout className="mr-2 text-[22px] text-primary-500" />
          Log Out
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    if (openNotification) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [openNotification]);

  return (
    <div className="fixed inset-0 z-30 flex h-16 w-full items-center justify-end gap-4 bg-white px-4">
      <div className="relative cursor-pointer select-none rounded-full bg-secondary-100 p-2 active:bg-secondary-200">
        {readNotificationsCount.length > 0 && (
          <span className="absolute -right-2 -top-1 rounded-full bg-red-500 px-2 text-sm text-white">
            {readNotificationsCount.length}
          </span>
        )}
        <IoNotificationsSharp
          className="text-[26px] text-secondary-900"
          onClick={handleNotificationClick}
        />
        {openNotification && <NotificationDropdown />}
      </div>

      <div
        className="relative flex h-full cursor-pointer select-none items-center rounded-sm px-2 hover:bg-secondary-50"
        onClick={() => {
          setOpenProfile(!openProfile);
          setOpenNotification(false);
        }}
      >
        <img
          src={admin?.profilePicture || DefaultImage}
          alt="Profile"
          className="h-11 w-11 rounded-full ring-2 ring-primary-500"
        />
        {admin && (
          <div className="ml-4 hidden flex-col text-center md:flex">
            {capitalizeWords(admin.firstName || "Admin")}{" "}
            {capitalizeWords(admin.lastName || "")}
            <span className="text-sm font-semibold capitalize">
              {admin.role || "Admin"}
            </span>
          </div>
        )}
        <MdKeyboardArrowDown className="ml-2 text-[18px] text-secondary-500" />
        {openProfile && <ProfileDropdown />}
      </div>
    </div>
  );
};

export default NavBar;
