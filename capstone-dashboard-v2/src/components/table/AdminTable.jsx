import React, { useEffect, useState } from "react";
import { Title } from "../props/Title";
import dayjs from "dayjs";
import { useAdminData } from "../../data/AdminData";
import { Button, Chip, Input, Tooltip } from "@material-tailwind/react";
import { TbEye, TbTrash, TbUserCheck, TbUserOff, TbX } from "react-icons/tb";
import DefaultImage from "../../assets/default.webp";
import Swal from "sweetalert2";

const formatDate = (date) =>
  date ? dayjs(date).format("MMM D - h:mm:s A") : "-";

const AdminActions = ({
  admin,
  onView,
  onActivate,
  onDeactivate,
  onDelete,
}) => {
  return (
    <td className="flex justify-end gap-3 px-4 py-2 text-right">
      <Tooltip
        content="View Account"
        className="!bg-opacity-60"
        placement="left"
      >
        <Button className="!bg-blue-500 !p-1" onClick={() => onView(admin)}>
          <TbEye className="text-[20px]" />
        </Button>
      </Tooltip>

      {admin.adminStatus === "active" ? (
        <Tooltip
          content="Deactivate Account"
          className="!bg-opacity-60"
          placement="left"
        >
          <Button
            className="!bg-neutral-500 !p-1"
            onClick={() => onDeactivate(admin._id)}
          >
            <TbUserOff className="text-[20px]" />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip
          content="Activate Account"
          className="!bg-opacity-60"
          placement="left"
        >
          <Button
            className="!bg-green-500 !p-1"
            onClick={() => onActivate(admin._id)}
          >
            <TbUserCheck className="text-[20px]" />
          </Button>
        </Tooltip>
      )}

      <Tooltip
        content="Delete Account"
        className="!bg-opacity-60"
        placement="left"
      >
        <Button
          className="!bg-red-500 !p-1"
          onClick={() => onDelete(admin._id)}
        >
          <TbTrash className="text-[20px]" />
        </Button>
      </Tooltip>
    </td>
  );
};

const AdminRow = ({
  admin,
  index,
  onView,
  onActivate,
  onDeactivate,
  onDelete,
}) => {
  const statusColors = {
    active: "blue",
    deactivated: "gray",
  };

  return (
    <tr className="bg-white text-sm hover:bg-secondary-50">
      <td className="w-[10px] whitespace-nowrap px-4 py-2">{index + 1}</td>
      <td className="w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
        {admin.firstName} {admin.lastName}
      </td>
      <td className="w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
        <div className="w-max">
          <Chip
            variant="ghost"
            color={statusColors[admin.adminStatus]}
            value={admin.adminStatus}
          />
        </div>
      </td>
      <td className="w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
        {formatDate(admin.loginDate)}
      </td>
      <td className="w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
        {formatDate(admin.logoutDate)}
      </td>
      <td className="w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2">
        {dayjs(admin.createdAt).format("MMMM D, YYYY")}
      </td>
      <AdminActions
        admin={admin}
        onView={onView}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
        onDelete={onDelete}
      />
    </tr>
  );
};

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

  const handleViewAccount = (admin) => {
    setSelectedAdmin(admin);
    setViewAccount(true);
  };

  const handleCloseModal = () => {
    setViewAccount(false);
    setSelectedAdmin(null);
  };

  const handleDeactivate = (adminId) => {
    const adminToDeactivate = admins.find((admin) => admin._id === adminId);

    Swal.fire({
      title: `Are you sure you want to deactivate ${adminToDeactivate.firstName} ${adminToDeactivate.lastName} account?`,
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
          Swal.fire({
            title: "Deactivated!",
            text: "Deactivated successfully.",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          console.error("Failed to deactivate admin:", error);
          Swal.fire("Error", "Failed to deactivate admin account.", "error");
        }
      }
    });
  };

  const handleActivate = (adminId) => {
    const adminToActivate = admins.find((admin) => admin._id === adminId);

    Swal.fire({
      title: `Are you sure you want to activate ${adminToActivate.firstName} ${adminToActivate.lastName} account?`,
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
    const adminToDelete = admins.find((admin) => admin._id === adminId);

    Swal.fire({
      title: `You want to delete ${adminToDelete.firstName} ${adminToDelete.lastName} account?`,
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
        <div className="overflow-auto bg-white p-4">
          <table className="min-w-full divide-y-2 divide-secondary-100 text-sm">
            <thead className="text-left">
              <tr className="whitespace-nowrap text-primary-500">
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Account Status</th>
                <th className="px-4 py-2">Last Log In</th>
                <th className="px-4 py-2">Last Log Out</th>
                <th className="px-4 py-2">Created Date</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="h-[400px] text-center capitalize">
                    <span className="loading loading-bars loading-lg bg-primary-500"></span>
                  </td>
                </tr>
              ) : admins.length ? (
                admins.map((admin, index) => (
                  <AdminRow
                    key={admin._id}
                    admin={admin}
                    index={index}
                    onView={handleViewAccount}
                    onActivate={handleActivate}
                    onDeactivate={handleDeactivate}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center capitalize">
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
                src={selectedAdmin.profilePicture || DefaultImage}
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
