import React, { useState, useEffect } from "react";
import {
  TbCameraFilled,
  TbCircleCheckFilled,
  TbEdit,
  TbLockFilled,
  TbX,
} from "react-icons/tb";
import DefaultPicture from "../../assets/default.jpg";
import { Title } from "../props/Title";
import { Button, Input } from "@material-tailwind/react";
import { useAdminData } from "../../data/AdminData";
import Swal from "sweetalert2";
import SendingEmail from "../../assets/EmailSending.webp";
import dayjs from "dayjs";

const ProfileCard = ({ admin }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState(null);

  const { updateAdmin, forgotPass } = useAdminData();

  useEffect(() => {
    if (admin) {
      setFirstName(admin.firstName);
      setLastName(admin.lastName);
      setPhone(admin.phone);
    }
  }, [admin]);

  const handlePassword = async () => {
    Swal.fire({
      title: "Password Reset",
      text: "Are you sure you want to reset your password?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reset",
      cancelButtonText: "No, cancel",
    })
      .then(async (result) => {
        if (result.isConfirmed) {
          setEmailLoading(true);
          try {
            await forgotPass(admin.email);
            Swal.fire(
              "Success",
              "Password reset link has been sent to your email.",
              "success",
            );
          } catch (error) {
            console.error("Error during password reset:", error);
            Swal.fire(
              "Error",
              "An error occurred while resetting your password.",
              "error",
            );
          } finally {
            setEmailLoading(false);
          }
        }
      })
      .catch((error) => {
        console.error("Error during password reset:", error);
      });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setProfileImage(imagePreview);
    setImagePreview(null);
  };

  const handleCancel = () => {
    setOpenEdit(false);
    setFirstName(admin.firstName);
    setLastName(admin.lastName);
    setPhone(admin.phone);
    setImagePreview(null);
    document.getElementById("profile-upload").value = null;
  };

  const isSaveButtonDisabled =
    firstName === admin?.firstName &&
    lastName === admin.lastName &&
    phone === admin.phone;

  const handleSaveChanges = async () => {
    if (!firstName || !lastName || !phone) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please fill in all required fields.",
      });
      return;
    }

    if (/[0-9]/.test(firstName) || /[0-9]/.test(lastName)) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "First name and last name cannot contain numbers.",
      });
      return;
    }

    if (/[a-zA-Z]/.test(phone)) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Phone number cannot contain letters.",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateAdmin({
        _id: admin._id,
        firstName,
        lastName,
        phone,
      });

      setLoading(false);
      setOpenEdit(false);
      Swal.fire({
        title: "Success",
        text: "Profile updated successfully.",
        icon: "success",
        confirmButtonText: "OK",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    } catch (err) {
      setLoading(false);
      setError("Failed to update profile. Please try again.");
      Swal.fire("Error", "Failed to update profile.", "error");
    }
  };

  if (emailLoading) {
    return (
      <>
        <div className="mt-2 flex min-h-[calc(100vh-200px)] flex-col items-center justify-center">
          <div className="flex flex-col items-center rounded-lg bg-white p-8 shadow-md shadow-secondary-100">
            <span className="loading loading-bars loading-lg"></span>
            <img
              src={SendingEmail}
              alt="Sending Email"
              className="h-[200px] w-[200px]"
            />
            <p>Please wait...</p>
          </div>
        </div>
      </>
    );
  }

  if (!admin) {
    return (
      <>
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
          <span className="loading loading-bars loading-lg"></span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex min-h-[calc(100vh-200px)] items-center bg-white shadow-md shadow-secondary-100">
        <div className="flex w-full flex-col gap-8 p-8 lg:p-16">
          <div className="relative mb-8 flex items-center justify-center">
            <label
              htmlFor="profile-upload"
              title="Upload Profile Picture"
              className="absolute h-32 w-32 cursor-pointer rounded-full text-4xl text-white/80 opacity-0 transition-opacity duration-300 hover:bg-black hover:bg-opacity-50 hover:opacity-100"
            >
              <TbCameraFilled className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
            </label>

            <img
              src={imagePreview || profileImage || DefaultPicture}
              alt="avatar"
              className="h-32 w-32 select-none rounded-full ring-4 ring-primary-500"
            />

            <input
              type="file"
              accept="image/*"
              id="profile-upload"
              className="hidden"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="absolute -bottom-[50px] mt-4 flex gap-2">
                <Button className="bg-blue-500" size="sm" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  color="red"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <div className="h-[2px] w-full bg-secondary-100"></div>
          <div className="flex flex-col gap-8 text-secondary-900">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-primary-500">
                Personal Information
              </h1>
              <div className="cursor-pointer rounded-full p-1 hover:bg-secondary-100 active:bg-secondary-200">
                <TbEdit
                  className="text-[20px]"
                  title="Edit Profile"
                  onClick={() => setOpenEdit(true)}
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <div className="font-medium">Name:</div>
              <div className="font-bold capitalize">
                {admin.firstName} {admin.lastName}
              </div>
            </div>

            {/* Phone */}
            <div>
              <div className="font-medium">Phone:</div>
              <div className="font-bold">{admin.phone}</div>
            </div>

            {/* Email */}
            <div>
              <div className="font-medium">Email:</div>
              <div className="flex items-center gap-2 font-bold lowercase">
                <span>{admin.email}</span>
                <span className="text-sm font-normal">
                  {admin.isEmailVerified ? (
                    <TbCircleCheckFilled
                      className="text-[18px] text-primary-500"
                      title="Verified"
                    />
                  ) : (
                    "unverified"
                  )}
                </span>
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="font-medium">Password:</div>
              <button
                className="btn btn-sm select-none"
                onClick={handlePassword}
              >
                <TbLockFilled className="text-[16px]" />
                Change Password
              </button>
            </div>

            <div>
              <div className="font-medium">Created date:</div>
              <div className="font-bold">
                {dayjs(admin.createdAt).format("MMM D, YYYY")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {openEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20">
          <div className="animate-fade-down animate-duration-[400ms] animate-ease-out">
            <div className="max-w-[500px]">
              <div className="flex items-center justify-between rounded-t-md border border-b-0 border-secondary-300 bg-secondary-100 px-4 py-2">
                <Title>Edit Profile</Title>
                <div
                  className="flex cursor-pointer items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
                  onClick={() => setOpenEdit(false)}
                >
                  <button>
                    <TbX />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-4 border border-secondary-300 bg-white p-4">
                <Input
                  type="text"
                  label="First Name"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  type="text"
                  label="Last Name"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                <Input
                  type="text"
                  label="Phone"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="outlined" color="red" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-500"
                    onClick={handleSaveChanges}
                    disabled={isSaveButtonDisabled || loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileCard;
