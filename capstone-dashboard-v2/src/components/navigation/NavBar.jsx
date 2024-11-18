import React, { useEffect, useState } from "react";
import useCurrentTime from "../hooks/useCurrentTime";
import { Link, useNavigate } from "react-router-dom";
import { IoNotificationsSharp } from "react-icons/io5";
import DefaultImage from "../../assets/default.webp";
import { useAdminData } from "../../data/AdminData";
import { useJobOrderData } from "../../data/JobOrderData";
import { MdKeyboardArrowDown, MdOutlineLogout } from "react-icons/md";
import { RiAccountCircleLine } from "react-icons/ri";

const NavBar = () => {
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const { timeAgo } = useCurrentTime();
  const navigate = useNavigate();

  const { getLoggedInAdmin, admin, logoutAdmin } = useAdminData();
  const { fetchProjects, projects, updateNotificationRead } = useJobOrderData();

  const [readNotifications, setReadNotifications] = useState(new Set());
  const [updateTime, setUpdateTime] = useState(Date.now());
  const [notificationLimit, setNotificationLimit] = useState(10);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate("/login-admin");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    getLoggedInAdmin();
  }, [getLoggedInAdmin]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchProjects();
      setUpdateTime(Date.now());
    }, 61000);

    return () => clearInterval(interval);
  }, [fetchProjects]);

  useEffect(() => {
    if (projects.length === 0) return;

    const newReadNotifications = new Set(
      projects
        .filter(
          (project) =>
            project.jobNotificationRead === true &&
            !readNotifications.has(project._id),
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
        project.inquiryStatus === "pending" &&
        !readNotifications.has(project._id),
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const displayedNotifications = unreadNotifications.slice(
    0,
    notificationLimit,
  );

  const handleSeeMore = () => {
    setNotificationLimit(unreadNotifications.length);
  };

  const handleNotificationClick = async (projectId) => {
    try {
      const updateResult = await updateNotificationRead(projectId);
      if (!updateResult.success) {
        console.error("Error updating notification:", updateResult.message);
        return;
      }

      fetchProjects();
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex h-16 w-full items-center justify-end gap-4 border-b bg-white px-4">
      {/* Notification */}
      <div className="relative cursor-pointer select-none rounded-full bg-secondary-100 p-2 active:bg-secondary-200">
        {/* Count only unread notifications */}
        {unreadNotifications.length > 0 && (
          <span className="absolute -right-2 -top-1 rounded-full bg-red-500 px-2 text-sm text-white">
            {unreadNotifications.length}
          </span>
        )}
        <IoNotificationsSharp
          className="text-[26px] text-secondary-900"
          onClick={() => {
            setOpenNotification(!openNotification);
            setOpenProfile(false);
          }}
        />
        {/* Notification Dropdown */}
        {openNotification && (
          <div className="absolute right-0 top-[51px] rounded-sm bg-white shadow-md">
            <p className="w-full border-b px-3 py-1 text-lg font-bold text-secondary-900">
              Notifications
            </p>
            <div className="max-h-[300px] w-[200px] overflow-auto">
              {displayedNotifications.length > 0 ? (
                displayedNotifications.map((project) => {
                  const truncatedMessage =
                    project.clientMessage?.length > 10
                      ? project.clientMessage.slice(0, 10) + "..."
                      : project.clientMessage || "N/A";

                  return (
                    <div
                      key={project._id}
                      className={`relative flex flex-col px-3 py-2 text-secondary-600 hover:bg-primary-50 ${
                        project.jobNotificationRead
                          ? "font-normal"
                          : "font-semibold"
                      }`}
                      onClick={() => handleNotificationClick(project._id)}
                    >
                      {project.jobNotificationRead === false && (
                        <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 text-xs text-white">
                          New
                        </span>
                      )}
                      <Link to="/track-job-orders">
                        <div className="flex flex-col">
                          <span className="flex gap-1 overflow-hidden whitespace-nowrap lowercase">
                            <p>{project.clientFirstName}</p>
                            <p>{project.clientLastName}</p>
                          </span>
                          <span className="text-sm font-normal lowercase">
                            {truncatedMessage}
                          </span>
                          <span className="text-xs">
                            {timeAgo(project.createdAt)}
                          </span>
                        </div>
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-secondary-400">
                  No new notifications
                </div>
              )}
            </div>
            <div className="p-2">
              {unreadNotifications.length > notificationLimit && (
                <button
                  onClick={handleSeeMore}
                  className="w-full rounded-md border bg-secondary-100 py-2 text-center text-sm text-secondary-900 hover:bg-secondary-100/50"
                >
                  See more
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div
        className="relative flex h-full cursor-pointer select-none items-center rounded-sm px-2 hover:bg-secondary-50"
        onClick={() => {
          setOpenProfile(!openProfile);
          setOpenNotification(false);
        }}
      >
        <img
          src={DefaultImage}
          className="h-11 rounded-full ring-2 ring-primary-500"
        />
        {admin && (
          <div className="ml-4 hidden flex-col text-center md:flex">
            <div className="flex gap-1">
              <span>{admin.firstName || "Best"}</span>
              <span>{admin.lastName || "Admin"}</span>
            </div>
            <span className="text-sm font-semibold capitalize">
              {admin.role || "Admin"}
            </span>
          </div>
        )}
        <MdKeyboardArrowDown className="ml-2 text-[18px] text-secondary-500" />
        {/* Profile Dropdown */}
        {openProfile && (
          <div className="absolute right-0 top-16 w-[150px] rounded-sm bg-white shadow-md">
            <div className="flex flex-col">
              <Link
                to="/my-profile"
                className="flex px-3 py-4 text-secondary-600 hover:bg-primary-50"
              >
                <RiAccountCircleLine className="mr-2 text-[26px] text-primary-500" />
                My Profile
              </Link>
              <button
                type="button"
                className="flex px-3 py-4 text-secondary-600 hover:bg-primary-50"
                onClick={handleLogout}
              >
                <MdOutlineLogout className="mr-2 text-[26px] text-primary-500" />
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
