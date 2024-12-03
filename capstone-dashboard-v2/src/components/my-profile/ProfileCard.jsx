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
  const [img, setImg] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState(null);
  const userID = localStorage.getItem("userID");
  const { updateAdmin, forgotPass, uploadProfile } = useAdminData();
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
      setImg(file);
    }
  };

  const handleSave = async () => {
    setProfileImage(imagePreview);
    setImagePreview(null);
    setIsUploadingImage(true);

    try {
      await uploadProfile(userID, img);
      setIsUploadingImage(false);
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
      setIsUploadingImage(false);
      setError("Failed to update profile. Please try again.");
      Swal.fire("Error", "Failed to update profile.", "error");
    }
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
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 text-center shadow-lg">
          <div className="relative">
            <span className="loading loading-spinner loading-lg text-primary-500"></span>
            <img
              src={SendingEmail}
              alt="Sending Email"
              className="h-[180px] w-[180px] object-contain"
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-secondary-900">
              Sending Reset Link
            </h3>
            <p className="text-sm text-secondary-600">
              Please check your email inbox...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <>
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
          <span className="loading loading-bars loading-lg bg-primary-500"></span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="rounded-xl bg-white p-6 shadow-lg shadow-secondary-100/50 lg:p-8">
        {/* Profile Header */}
        <div className="relative mb-16 flex flex-col items-center">
          {/* Profile Image Section */}
          <div className="relative">
            <div className="relative">
              <img
                src={imagePreview || admin.profilePicture || DefaultPicture}
                alt="avatar"
                className="h-32 w-32 rounded-full object-cover ring-4 ring-primary-500 transition-all duration-300 hover:ring-primary-600"
              />
              {/* Loading overlay for image upload */}
              {isUploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2">
                    <span className="loading loading-spinner loading-sm text-white"></span>
                    <span className="text-xs text-white">Uploading...</span>
                  </div>
                </div>
              )}
              {!isUploadingImage && (
                <label
                  htmlFor="profile-upload"
                  title="Upload Profile Picture"
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white shadow-md transition-all duration-300 hover:bg-primary-600"
                >
                  <TbCameraFilled className="text-lg" />
                </label>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              id="profile-upload"
              className="hidden"
              onChange={handleImageChange}
              disabled={isUploadingImage}
            />
          </div>

          {/* Profile Name */}
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold capitalize text-secondary-900">
              {admin.firstName} {admin.lastName}
            </h2>
            <p className="text-sm text-secondary-600">Administrator</p>
          </div>

          {/* Image Upload Actions */}
          {imagePreview && (
            <div className="mt-4 flex gap-2">
              <Button
                className="flex min-w-[120px] items-center justify-center gap-2 bg-primary-500 px-4 py-2 text-sm"
                size="sm"
                onClick={handleSave}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? (
                  <>
                    <span className="loading loading-spinner loading-xs text-white"></span>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <TbCircleCheckFilled />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
              <Button
                variant="outlined"
                color="red"
                size="sm"
                className="flex items-center gap-2 px-4 py-2 text-sm"
                onClick={handleCancel}
                disabled={isUploadingImage}
              >
                <TbX />
                <span>Cancel</span>
              </Button>
            </div>
          )}
        </div>

        {/* Information Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <div className="rounded-xl border border-secondary-100 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary-500">
                Personal Information
              </h3>
              <button
                onClick={() => setOpenEdit(true)}
                className="rounded-full p-2 text-secondary-600 transition-colors hover:bg-secondary-50"
              >
                <TbEdit className="text-xl" title="Edit Profile" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-1">
                <span className="text-sm text-secondary-600">Email</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium lowercase">{admin.email}</span>
                  {admin.isEmailVerified && (
                    <TbCircleCheckFilled
                      className="text-lg text-primary-500"
                      title="Verified"
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-1">
                <span className="text-sm text-secondary-600">Phone</span>
                <span className="font-medium">{admin.phone}</span>
              </div>

              <div className="grid gap-1">
                <span className="text-sm text-secondary-600">Created At</span>
                <span className="font-medium">
                  {dayjs(admin.createdAt).format("MMMM D, YYYY")}
                </span>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="rounded-xl border border-secondary-100 p-6">
            <h3 className="mb-6 text-lg font-semibold text-primary-500">
              Account Security
            </h3>
            <div className="space-y-4">
              <div className="grid gap-1">
                <span className="text-sm text-secondary-600">Password</span>
                <button
                  onClick={handlePassword}
                  className="flex w-fit items-center gap-2 rounded-lg bg-secondary-50 px-4 py-2 text-sm font-medium text-secondary-900 transition-colors hover:bg-secondary-100"
                >
                  <TbLockFilled />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {openEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center rounded-md bg-black/20 backdrop-blur-sm">
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
                  <Button
                    variant="outlined"
                    color="red"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex min-w-[120px] items-center justify-center gap-2 bg-blue-500"
                    onClick={handleSaveChanges}
                    disabled={isSaveButtonDisabled || loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-xs text-white"></span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      "Save Changes"
                    )}
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
