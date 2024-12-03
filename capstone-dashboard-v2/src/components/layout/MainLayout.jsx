import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../navigation/NavBar";
import SideBar from "../navigation/SideBar";

const MainLayout = () => {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <>
      {isLoggedIn && <SideBar />}
      <div className="lg:ml-24">
        {isLoggedIn && <NavBar />}
        <div>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default MainLayout;
