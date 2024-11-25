import React, { useEffect, useState } from "react";
import { Title } from "../props/Title";
import dayjs from "dayjs";
import { useAdminData } from "../../data/AdminData";
import {
  Button,
  Chip,
  Input,
  Tooltip,
  Typography,
} from "@material-tailwind/react";
import { TbEye, TbTrash, TbUserCheck, TbUserOff, TbX } from "react-icons/tb";
import DefaultImage from "../../assets/default.webp";
import Swal from "sweetalert2";

const AdminTable = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAllAdmins, deactivateAdmin, activateAdmin, deleteAdmin } =
    useAdminData();
  const [viewAccount, setViewAccount] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      const fetchedAdmins = await getAllAdmins();
      if (fetchedAdmins) {
        setAdmins(fetchedAdmins);
      }
      setLoading(false);
    };
    fetchAdmins();
  }, [getAllAdmins]);

  const statusColors = {
    active: "green",
    deactivated: "gray",
  };

  const handleViewAccount = (admin) => {
    setSelectedAdmin(admin);
    setViewAccount(true);
  };

  const handleCloseModal = () => {
    setViewAccount(false);
    setSelectedAdmin(null);
  };

  const handleDeactivate = (adminId) => {
    Swal.fire({
      title: "Are you sure you want to deactivate this admin account?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, deactivate it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deactivateAdmin(adminId);
          setAdmins((prev) =>
            prev.map((admin) =>
              admin._id === adminId
                ? { ...admin, adminStatus: "deactivated" }
                : admin,
            ),
          );

          Swal.fire(
            "Deactivated!",
            "Admin account has been deactivated.",
            "success",
          );
        } catch (error) {
          console.error("Failed to deactivate admin:", error);
          Swal.fire("Error", "Failed to deactivate admin account.", "error");
        }
      }
    });
  };

  const handleActivate = (adminId) => {
    Swal.fire({
      title: "Are you sure you want to activate this admin account?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, activate it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await activateAdmin(adminId);
          setAdmins((prev) =>
            prev.map((admin) =>
              admin._id === adminId
                ? { ...admin, adminStatus: "active" }
                : admin,
            ),
          );

          Swal.fire(
            "Activated!",
            "Admin account has been activated.",
            "success",
          );
        } catch (error) {
          console.error("Failed to activate admin:", error);
          Swal.fire("Error", "Failed to activate admin account.", "error");
        }
      }
    });
  };

  const handleDelete = (adminId) => {
    Swal.fire({
      title: "You want to delete this admin account?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Are you sure?",
          text: "This action cannot be undone!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete it!",
        }).then(async (finalResult) => {
          if (finalResult.isConfirmed) {
            try {
              await deleteAdmin(adminId);
              setAdmins((prev) =>
                prev.filter((admin) => admin._id !== adminId),
              );

              Swal.fire(
                "Deleted!",
                "Admin account has been deleted.",
                "success",
              );
            } catch (error) {
              console.error("Failed to delete admin:", error);
              Swal.fire("Error", "Failed to delete admin account.", "error");
            }
          }
        });
      }
    });
  };

  return (
    <>
      <div className="border border-secondary-200">
        <div className="border-b border-secondary-200 bg-secondary-100 px-4 py-2">
          <Title variant="secondarySemibold" size="lg">
            Admin List
          </Title>
        </div>
        {/* table */}
        <div className="overflow-x-auto">
          <table className="table bg-white text-base">
            <thead>
              <tr className="border-b-2 border-secondary-200 text-base text-primary-500">
                <th className="w-10">No</th>
                <th className="min-w-[150px]">Name</th>
                <th className="min-w-[130px]">Account Status</th>
                <th className="min-w-[200px]">Last Log In</th>
                <th className="min-w-[200px]">Last Log Out</th>
                <th className="w-full">Created Date</th>
                <th className="min-w-[150px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="h-[400px] text-center capitalize">
                    <span className="loading loading-bars loading-lg"></span>
                  </td>
                </tr>
              ) : admins && admins.length > 0 ? (
                admins.map((admin, index) => (
                  <tr
                    key={admin._id}
                    className="text-sm uppercase hover:bg-secondary-50"
                  >
                    <td>{index + 1}</td>
                    <td>
                      {admin.firstName} {admin.lastName}
                    </td>
                    <td>
                      <div className="flex font-semibold">
                        <Chip
                          variant="ghost"
                          color={statusColors[admin.adminStatus]}
                          value={
                            <Typography
                              variant="small"
                              className="font-bold capitalize leading-none"
                            >
                              {admin.adminStatus}
                            </Typography>
                          }
                        />
                      </div>
                    </td>
                    <td>
                      {admin.loginDate
                        ? dayjs(admin.loginDate).format("MMM D - h:mm:s A")
                        : "-"}
                    </td>
                    <td>
                      {admin.logoutDate
                        ? dayjs(admin.logoutDate).format("MMM D - h:mm:s A")
                        : "-"}
                    </td>
                    <td>{dayjs(admin.createdAt).format("MMMM D, YYYY")}</td>
                    <td className="flex items-center gap-3">
                      <Tooltip
                        content="View Account"
                        className="!bg-opacity-60"
                        placement="left"
                      >
                        <Button
                          className="!bg-blue-500 !p-1"
                          onClick={() => handleViewAccount(admin)}
                        >
                          <TbEye className="text-[20px]" />
                        </Button>
                      </Tooltip>
                      {admin.adminStatus === "active" ? (
                        <Tooltip
                          content="Deactivate Account"
                          className="!bg-opacity-60"
                        >
                          <Button
                            className="!bg-neutral-500 !p-1"
                            onClick={() => handleDeactivate(admin._id)}
                          >
                            <TbUserOff className="text-[20px]" />
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip
                          content="Activate Account"
                          className="!bg-opacity-60"
                        >
                          <Button
                            className="!bg-green-500 !p-1"
                            onClick={() => handleActivate(admin._id)}
                          >
                            <TbUserCheck className="text-[20px]" />
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip
                        content="Delete Account"
                        className="!bg-opacity-60"
                      >
                        <Button
                          className="!bg-red-500 !p-1"
                          onClick={() => handleDelete(admin._id)}
                        >
                          <TbTrash className="text-[20px]" />
                        </Button>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center capitalize">
                    No admin records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Account Modal */}
      {viewAccount && selectedAdmin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20">
          <div className="animate-fade-down animate-duration-[400ms] animate-ease-out">
            <div className="flex items-center justify-between rounded-t-md border border-b-0 border-secondary-300 bg-secondary-100 px-4 py-2">
              <Title>Account Details</Title>
              <div
                className="flex cursor-pointer items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
                onClick={handleCloseModal}
              >
                <button>
                  <TbX />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-b-lg border border-secondary-300 bg-white p-4">
              <img
                src={DefaultImage}
                alt="Logo"
                className="h-24 w-24 self-center rounded-full ring-2 ring-primary-500"
              />
              <div className="flex gap-2">
                <Input
                  label="First Name"
                  type="text"
                  value={selectedAdmin.firstName}
                  readOnly
                />
                <Input
                  label="Last Name"
                  type="text"
                  value={selectedAdmin.lastName}
                  readOnly
                />
              </div>
              <Input
                label="Email"
                type="text"
                value={selectedAdmin.email}
                readOnly
              />
              <Input
                label="Phone number"
                type="text"
                value={selectedAdmin.phone}
                readOnly
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminTable;
