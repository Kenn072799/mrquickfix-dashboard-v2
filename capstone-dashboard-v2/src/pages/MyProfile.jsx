import React, { useEffect } from "react";
import { Title } from "../components/props/Title";
import ProfileCard from "../components/my-profile/ProfileCard";
import { useAdminData } from "../data/AdminData";

const MyProfile = () => {
  const { getLoggedInAdmin, admin } = useAdminData();

  useEffect(() => {
    document.title = "Mr. Quick Fix | My Profile";
    getLoggedInAdmin();
  }, [getLoggedInAdmin]);

  return (
    <div className="mt-16 min-h-[calc(100vh-64px)] p-4 lg:p-8">
      <Title variant="secondaryBold" size="xxxl">
        My Profile
      </Title>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <ProfileCard admin={admin} />
      </div>
    </div>
  );
};

export default MyProfile;
