import React from "react";
import MainLayout from "./components/layout/MainLayout";
import { Route, Routes } from "react-router-dom";

//pages
import Dashboard from "./pages/Dashboard";
import TrackJobOrder from "./pages/TrackJobOrder";
import Login from "./pages/Login";

function App() {
  return (
    <>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/track-job-orders" element={<TrackJobOrder />} />
          <Route path="/login-admin" element={<Login />} />
        </Routes>
      </MainLayout>
    </>
  );
}

export default App;
