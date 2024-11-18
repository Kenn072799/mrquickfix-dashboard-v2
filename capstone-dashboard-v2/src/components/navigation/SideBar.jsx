import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAdminData } from "../../data/AdminData";

//png
import Logo from "../../assets/Mr.QuickFixLogo.webp";
import Icon from "../../assets/Mr. Quick Fix icon.webp";

//icons
import { IoChevronDownOutline } from "react-icons/io5";
import {
  MdOutlineSpaceDashboard,
  MdOutlineManageAccounts,
  MdOutlineLogout,
  MdOutlineAnalytics,
} from "react-icons/md";
import { LiaProjectDiagramSolid } from "react-icons/lia";
import { RiAccountCircleLine } from "react-icons/ri";
import { TbSettings } from "react-icons/tb";
import { BiBookContent } from "react-icons/bi";

const SideBar = () => {
  const [openMisc, setOpenMisc] = useState(false);
  const [openMenu, setOpenMenu] = useState(true);
  const navigate = useNavigate();
  const { logoutAdmin } = useAdminData();

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate("/login-admin");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div
      className={`sticky select-none top-0 z-50 hidden h-screen shadow-md duration-300 md:block ${
        openMenu ? "w-24 bg-secondary-950" : "w-[300px] bg-white px-4"
      }`}
    >
      <div
        className="hover:bg-slate-100 absolute -right-3 top-5 cursor-pointer rounded-full bg-white ring-1 ring-secondary-100"
        onClick={() => setOpenMenu(!openMenu)}
      >
        <IoChevronDownOutline
          className={`text-[20px] text-primary-500 ${
            openMenu ? "rotate-[270deg]" : "rotate-[90deg]"
          }`}
        />
      </div>
      <div className="ml-4 mt-8">
        {!openMenu ? (
          <img
            src={Logo}
            alt="Mr. Quick Fix"
            className={`${!openMenu ? "h-10" : "scale-0"}`}
          />
        ) : (
          <img
            src={Icon}
            alt="Mr. Quick Fix"
            className={`${openMenu && "h-12 rotate-[360deg] duration-500"}`}
          />
        )}
      </div>
      <div>
        <ul
          className={`cursor-pointer pt-8 text-gray-600 ${
            openMenu && "flex flex-col items-center"
          }`}
        >
          <li className="w-full rounded-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `group relative inline-flex w-full items-center rounded-sm px-2 ${
                  isActive
                    ? "bg-primary-500 py-2 text-primary-50"
                    : "py-2 text-secondary-600 hover:bg-primary-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <MdOutlineSpaceDashboard
                    className={`duration-500 ${
                      openMenu ? "my-3 ml-5 text-[26px]" : "mr-2 text-[26px]"
                    } ${isActive ? "text-primary-50" : "text-primary-500"}`}
                  />
                  <span
                    className={`ml-2 duration-500 ${
                      openMenu
                        ? "absolute left-20 hidden whitespace-nowrap rounded-sm bg-secondary-800/80 p-3 text-sm text-primary-50 group-hover:block"
                        : ""
                    }`}
                  >
                    Dashboard
                  </span>
                </>
              )}
            </NavLink>
          </li>
          <li className="w-full rounded-sm">
            <NavLink
              to="/track-job-orders"
              className={({ isActive }) =>
                `group relative inline-flex w-full items-center rounded-sm px-2 ${
                  isActive
                    ? "bg-primary-500 py-2 text-primary-50"
                    : "py-2 text-secondary-600 hover:bg-primary-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LiaProjectDiagramSolid
                    className={`duration-500 ${
                      openMenu ? "my-3 ml-5 text-[26px]" : "mr-2 text-[26px]"
                    } ${isActive ? "text-primary-50" : "text-primary-500"}`}
                  />
                  <span
                    className={`ml-2 duration-500 ${
                      openMenu
                        ? "absolute left-20 hidden whitespace-nowrap rounded-sm bg-secondary-800/80 p-3 text-sm text-primary-50 group-hover:block"
                        : ""
                    }`}
                  >
                    Track Job Orders
                  </span>
                </>
              )}
            </NavLink>
          </li>
          <li className="w-full rounded-sm">
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `group relative inline-flex w-full items-center rounded-sm px-2 ${
                  isActive
                    ? "bg-primary-500 py-2 text-primary-50"
                    : "py-2 text-secondary-600 hover:bg-primary-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <MdOutlineAnalytics
                    className={`duration-500 ${
                      openMenu ? "my-3 ml-5 text-[26px]" : "mr-2 text-[26px]"
                    } ${isActive ? "text-primary-50" : "text-primary-500"}`}
                  />
                  <span
                    className={`ml-2 duration-500 ${
                      openMenu
                        ? "absolute left-20 hidden whitespace-nowrap rounded-sm bg-secondary-800/80 p-3 text-sm text-primary-50 group-hover:block"
                        : ""
                    }`}
                  >
                    Reports
                  </span>
                </>
              )}
            </NavLink>
          </li>
          <div className="my-4 h-[1.1px] w-full bg-secondary-200"></div>
          <li
            className="group relative inline-flex w-full rounded-sm px-2 py-2 hover:bg-primary-50"
            onClick={() => setOpenMisc(!openMisc)}
          >
            <TbSettings
              className={`mr-2 text-primary-500 duration-500 ${
                openMenu
                  ? "my-3 ml-5 text-[26px] text-primary-500"
                  : "mr-2 text-[26px]"
              } ${openMisc && "rotate-90"}`}
            />
            <span
              className={`ml-2 duration-500 ${
                openMenu
                  ? "absolute left-20 hidden whitespace-nowrap rounded-sm bg-secondary-800/80 p-3 text-sm text-primary-50 group-hover:block"
                  : ""
              }`}
            >
              Miscellaneous
            </span>
            {openMenu ? (
              <IoChevronDownOutline
                size={18}
                className={`absolute bottom-7 right-1 text-secondary-600 duration-300 ${
                  openMisc && "rotate-180"
                }`}
              />
            ) : (
              <IoChevronDownOutline
                size={18}
                className={`absolute right-4 top-3 duration-300 ${
                  openMisc && "rotate-180"
                }`}
              />
            )}
          </li>
          {openMisc && (
            <ul className="flex w-full flex-col bg-primary-50/20">
              <li className="group relative w-full rounded-sm">
                <NavLink
                  to="/content-management"
                  className={({ isActive }) =>
                    `inline-flex w-full items-center rounded-sm px-2 ${
                      isActive
                        ? "bg-primary-500 py-2 text-primary-50"
                        : "py-2 text-secondary-600 hover:bg-primary-50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <BiBookContent
                        className={`duration-500 ${
                          openMenu
                            ? "my-3 ml-5 text-[26px] text-primary-50"
                            : "mr-2 text-[26px]"
                        } ${isActive ? "text-primary-50" : "text-primary-500"}`}
                      />
                      <span
                        className={`ml-2 duration-500 ${
                          openMenu
                            ? "absolute left-20 hidden whitespace-nowrap rounded-sm bg-secondary-800/80 p-3 text-sm text-primary-50 group-hover:block"
                            : ""
                        }`}
                      >
                        Content Management
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
              <li className="group relative w-full rounded-sm">
                <NavLink
                  to="/account-management"
                  className={({ isActive }) =>
                    `inline-flex w-full items-center rounded-sm px-2 ${
                      isActive
                        ? "bg-primary-500 py-2 text-primary-50"
                        : "py-2 text-secondary-600 hover:bg-primary-50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <MdOutlineManageAccounts
                        className={`duration-500 ${
                          openMenu
                            ? "my-3 ml-5 text-[26px] text-primary-50"
                            : "mr-2 text-[26px]"
                        } ${isActive ? "text-primary-50" : "text-primary-500"}`}
                      />
                      <span
                        className={`ml-2 duration-500 ${
                          openMenu
                            ? "absolute left-20 hidden whitespace-nowrap rounded-sm bg-secondary-800/80 p-3 text-sm text-primary-50 group-hover:block"
                            : ""
                        }`}
                      >
                        Account Management
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            </ul>
          )}
          <li className="w-full rounded-sm">
            <NavLink
              to="/my-profile"
              className={({ isActive }) =>
                `group relative inline-flex w-full items-center rounded-sm px-2 ${
                  isActive
                    ? "bg-primary-500 py-2 text-primary-50"
                    : "py-2 text-secondary-600 hover:bg-primary-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <RiAccountCircleLine
                    className={`duration-500 ${
                      openMenu ? "my-3 ml-5 text-[26px]" : "mr-2 text-[26px]"
                    } ${isActive ? "text-primary-50" : "text-primary-500"}`}
                  />
                  <span
                    className={`ml-2 duration-500 ${
                      openMenu
                        ? "absolute left-20 hidden whitespace-nowrap rounded-sm bg-secondary-800/80 p-3 text-sm text-primary-50 group-hover:block"
                        : ""
                    }`}
                  >
                    My Profile
                  </span>
                </>
              )}
            </NavLink>
          </li>
          <div className="my-4 h-[1.1px] w-full bg-secondary-200"></div>
          <li className="w-full rounded-sm">
            <button
              type="button"
              className={`group relative inline-flex w-full items-center rounded-sm px-2 py-2 text-secondary-600 hover:bg-primary-50`}
              onClick={handleLogout}
            >
              <MdOutlineLogout
                className={`duration-500 ${
                  openMenu ? "my-3 ml-5 text-[26px]" : "mr-2 text-[26px]"
                } text-primary-500`}
              />
              <span
                className={`ml-2 duration-500 ${
                  openMenu
                    ? "absolute left-20 hidden whitespace-nowrap rounded-sm bg-secondary-800/80 p-3 text-sm text-primary-50 group-hover:block"
                    : ""
                }`}
              >
                Log Out
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
