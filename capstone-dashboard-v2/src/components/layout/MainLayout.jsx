import React from "react";
import { useLocation } from "react-router-dom";
import NavBar from "../navigation/NavBar";
import SideBar from "../navigation/SideBar";

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const showLayout = !isLoggedIn || location.pathname === "/";

  return (
    <>
      <div className="flex">
        {showLayout && <SideBar />}
        <div className="flex w-full flex-col">
          {showLayout && <NavBar />}
          <div className="bg-secondary-50">{children}</div>
        </div>
      </div>
    </>
  );
};

export default MainLayout;
