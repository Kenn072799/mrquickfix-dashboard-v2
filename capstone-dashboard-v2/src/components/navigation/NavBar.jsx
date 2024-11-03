import React, { useEffect, useState } from "react";
import useCurrentTime from "../hooks/useCurrentTime";
import { Button } from "../props/button";
import { Link, useNavigate } from "react-router-dom";

//icons
import { MdKeyboardArrowDown, MdOutlineLogout } from "react-icons/md";
import { IoNotificationsSharp } from "react-icons/io5";
import { RiAccountCircleLine } from "react-icons/ri";

//png
import Man from "../../assets/profile.png";
import { useAdminData } from "../../data/AdminData";

const notification = 5;
const notificationList = [
  {
    id: 1,
    customerFirstName: "Kenneth",
    customerLastName: "Altes",
    date: "10/21/2024, 01:00 AM",
  },
  {
    id: 2,
    customerFirstName: "Kenneth",
    customerLastName: "Altes",
    date: "10/21/2024, 01:00 AM",
  },
  {
    id: 3,
    customerFirstName: "Kenneth",
    customerLastName: "Altes",
    date: "10/21/2024, 01:00 AM",
  },
  {
    id: 4,
    customerFirstName: "Kenneth",
    customerLastName: "Altes",
    date: "10/21/2024, 01:00 AM",
  },
  {
    id: 5,
    customerFirstName: "Kenneth",
    customerLastName: "Altes",
    date: "10/21/2024, 01:00 AM",
  },
];

const NavBar = () => {
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const { timeAgo } = useCurrentTime();
  const navigate = useNavigate();

  const { getLoggedInAdmin, admin, loading, error, logoutAdmin } = useAdminData();

  const [admins, setAdmins] = useState([]);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate("/login-admin");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const fetchedAdmins = await getLoggedInAdmin();
        if (fetchedAdmins) {
          setAdmins([fetchedAdmins]);
        }
      } catch (err) {
        console.error("Error fetching admins:", err);
      }
    };

    fetchAdmins();
  }, [getLoggedInAdmin]);

  return (
    <div className="fixed inset-0 z-40 flex h-16 w-full items-center justify-end gap-4 border-b bg-white px-4">
      {/* notification */}
      <div
        className="relative cursor-pointer rounded-full bg-secondary-100 p-2 active:bg-secondary-200"
        onClick={() =>
          setOpenNotification(!openNotification) || setOpenProfile(false)
        }
      >
        <span className="absolute -right-2 -top-1 rounded-full bg-red-500 px-2 text-sm text-white">
          {notification}
        </span>
        <IoNotificationsSharp className="text-[26px] text-secondary-900" />
        {/* notification dropdown */}
        {openNotification && (
          <div className="absolute right-0 top-[51px] rounded-sm bg-white shadow-md">
            <p className="w-full border-b px-3 py-1 text-lg font-bold text-secondary-900">
              Notifications
            </p>
            <div className="max-h-[300px] w-[200px] overflow-auto">
              {notificationList.map((notification) => (
                <div
                  key={notification.id}
                  className="flex flex-col px-3 py-2 text-secondary-600 hover:bg-primary-50"
                >
                  <span className="flex gap-1 font-semibold">
                    <p>{notification.customerFirstName}</p>
                    <p>{notification.customerLastName}</p>
                  </span>
                  <span className="text-xs">{timeAgo(notification.date)}</span>
                </div>
              ))}
            </div>
            <div className="p-2">
              <Button variant="primary" size="sm">
                See more
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* profile */}
      <div
        className="relative flex h-full cursor-pointer items-center rounded-sm px-2 hover:bg-secondary-50"
        onClick={() =>
          setOpenProfile(!openProfile) || setOpenNotification(false)
        }
      >
        <img src={Man} className="h-11 rounded-full ring-2 ring-primary-500" />
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
        {/* profile dropdown */}
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
