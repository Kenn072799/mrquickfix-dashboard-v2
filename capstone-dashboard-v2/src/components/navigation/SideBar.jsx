import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAdminData } from "../../data/AdminData";

// PNG
import Logo from "../../assets/Mr.QuickFixLogo.webp";
import Icon from "../../assets/Mr. Quick Fix icon.webp";

// Icons
import { IoChevronDownOutline } from "react-icons/io5";
import {
  MdOutlineSpaceDashboard,
  MdOutlineManageAccounts,
  MdOutlineLogout,
  MdOutlineAnalytics,
} from "react-icons/md";
import { LiaProjectDiagramSolid } from "react-icons/lia";
import { RiAccountCircleLine } from "react-icons/ri";
import { TbMenu2, TbSettings } from "react-icons/tb";
import { BiBookContent } from "react-icons/bi";
import Swal from "sweetalert2";

const NavItem = ({
  to,
  icon: IconComponent,
  label,
  openMenu,
  onClick,
  children,
}) => {
  return (
    <li className="w-full rounded-sm">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `group relative inline-flex w-full items-center rounded-sm px-2 py-2 ${
            isActive
              ? "bg-primary-500 text-primary-50"
              : "text-secondary-600 hover:bg-primary-50"
          }`
        }
        onClick={onClick}
      >
        {({ isActive }) => (
          <>
            <IconComponent
              className={`duration-500 ${
                openMenu ? "my-3 ml-5 text-[26px]" : "mr-2 text-[22px]"
              } ${isActive ? "text-primary-50" : "text-primary-500"}`}
            />
            <span
              className={`ml-2 duration-500 ${
                openMenu
                  ? "absolute left-20 hidden whitespace-nowrap rounded-sm bg-secondary-800/80 p-3 text-sm text-primary-50 lg:group-hover:block"
                  : ""
              }`}
            >
              {label}
            </span>
          </>
        )}
      </NavLink>
      {children}
    </li>
  );
};

const MiscellaneousSection = ({ openMenu, openMisc, setOpenMisc }) => {
  return (
    <li
      className="group relative inline-flex w-full cursor-pointer rounded-sm px-2 py-2 hover:bg-primary-50"
      onClick={() => setOpenMisc(!openMisc)}
    >
      <TbSettings
        className={`duration-500 ${
          openMenu ? "my-3 ml-5 text-[26px]" : "mr-2 text-[22px]"
        } ${openMisc && "rotate-90"} text-primary-500`}
      />
      <span
        className={`ml-2 duration-500 ${
          openMenu
            ? "absolute left-20 hidden whitespace-nowrap rounded-sm bg-secondary-800/80 p-3 text-sm text-primary-50 lg:group-hover:block"
            : ""
        }`}
      >
        Miscellaneous
      </span>
      <IoChevronDownOutline
        size={18}
        className={`absolute ${
          openMenu ? "bottom-7 right-1" : "right-4 top-3"
        } text-secondary-600 duration-300 ${openMisc && "rotate-180"}`}
      />
    </li>
  );
};

const SideBar = () => {
  const [openMisc, setOpenMisc] = useState(false);
  const [openMenu, setOpenMenu] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logoutAdmin } = useAdminData();

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

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed left-4 top-4 z-40 rounded-md p-2 text-primary-500 lg:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <TbMenu2 className="text-2xl" />
      </button>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 z-40 h-screen select-none shadow-md duration-300 ${mobileMenuOpen ? "left-0 px-4" : "-left-full"} lg:left-0 lg:block ${openMenu ? "lg:w-24 lg:bg-secondary-950" : "lg:w-[300px] px-4"} w-[300px] bg-white`}
      >
        {/* Toggle Menu Button (Desktop only) */}
        <div
          className="hover:bg-slate-100 absolute -right-3 top-5 hidden cursor-pointer rounded-full bg-white ring-1 ring-secondary-100 lg:block"
          onClick={() => setOpenMenu(!openMenu)}
        >
          <IoChevronDownOutline
            className={`text-[20px] text-primary-500 ${openMenu ? "rotate-[270deg]" : "rotate-[90deg]"}`}
          />
        </div>

        <button
          className="absolute right-4 top-4 text-secondary-600 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          ✕
        </button>

        <div className="ml-4 mt-8">
          <img
            src={openMenu && !mobileMenuOpen ? Icon : Logo}
            alt="Mr. Quick Fix"
            className={`${openMenu && !mobileMenuOpen ? "h-12" : "h-10"} ${
              openMenu && !mobileMenuOpen
                ? "animate-fade-left"
                : "animate-fade-right"
            }`}
          />
        </div>

        {/* Sidebar Menu */}
        <ul
          className={`cursor-pointer pt-8 text-gray-600 ${openMenu && !mobileMenuOpen && "lg:flex lg:flex-col lg:items-center"}`}
        >
          <NavItem
            to="/"
            icon={MdOutlineSpaceDashboard}
            label="Dashboard"
            openMenu={openMenu && !mobileMenuOpen}
            onClick={() => setMobileMenuOpen(false)}
          />
          <NavItem
            to="/track-job-orders"
            icon={LiaProjectDiagramSolid}
            label="Track Job Orders"
            openMenu={openMenu && !mobileMenuOpen}
            onClick={() => setMobileMenuOpen(false)}
          />
          <NavItem
            to="/reports"
            icon={MdOutlineAnalytics}
            label="Reports"
            openMenu={openMenu && !mobileMenuOpen}
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="my-4 h-[1.1px] w-full bg-secondary-200" />

          {/* Miscellaneous Section */}
          <MiscellaneousSection
            openMenu={openMenu && !mobileMenuOpen}
            openMisc={openMisc}
            setOpenMisc={setOpenMisc}
          />

          {openMisc && (
            <ul className="flex w-full flex-col bg-primary-50/20">
              <NavItem
                to="/content-management"
                icon={BiBookContent}
                label="Content Management"
                openMenu={openMenu && !mobileMenuOpen}
                onClick={() => setMobileMenuOpen(false)}
              />
              <NavItem
                to="/account-management"
                icon={MdOutlineManageAccounts}
                label="Account Management"
                openMenu={openMenu && !mobileMenuOpen}
                onClick={() => setMobileMenuOpen(false)}
              />
            </ul>
          )}
          <NavItem
            to="/my-profile"
            icon={RiAccountCircleLine}
            label="My Profile"
            openMenu={openMenu && !mobileMenuOpen}
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="my-4 h-[1.1px] w-full bg-secondary-200" />

          {/* Logout Button */}
          <li className="w-full rounded-sm">
            <button
              type="button"
              className="group relative inline-flex w-full items-center rounded-sm px-2 py-2 text-secondary-600 hover:bg-primary-50"
              onClick={handleLogout}
            >
              <MdOutlineLogout
                className={`duration-500 ${
                  openMenu && !mobileMenuOpen
                    ? "my-3 ml-5 text-[26px]"
                    : "mr-2 text-[26px]"
                } text-primary-500`}
              />
              <span
                className={`ml-2 duration-500 ${
                  openMenu && !mobileMenuOpen
                    ? "absolute left-20 hidden whitespace-nowrap rounded-sm bg-secondary-800/80 p-3 text-sm text-primary-50 lg:group-hover:block"
                    : ""
                }`}
              >
                Log Out
              </span>
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default SideBar;
