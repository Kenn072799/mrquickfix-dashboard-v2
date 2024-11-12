import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../navigation/NavBar";
import SideBar from "../navigation/SideBar";

const MainLayout = () => {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <>
      <div className="flex">
        {isLoggedIn && <SideBar />}
        <div className="flex w-full flex-col">
          {isLoggedIn && <NavBar />}
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default MainLayout;
