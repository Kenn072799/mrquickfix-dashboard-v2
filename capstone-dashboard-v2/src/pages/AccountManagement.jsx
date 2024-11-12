import React, { useEffect, useState } from "react";
import SignupAdmin from "../components/account-management/SignupAdmin";
import { Title } from "../components/props/Title";
import { Button } from "../components/props/button";
import { TbUserPlus } from "react-icons/tb";
import AdminTable from "../components/table/AdminTable";

const AccountManagement = () => {
  useEffect(() => {
    document.title = "Mr. Quick Fix | Account Management";
  }, []);

  const [isOpen, setIsOpen] = useState(false);

  const openForm = () => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeForm = () => {
    setIsOpen(false);
    document.body.style.overflow = "auto";
  };

  return (
    <div className="mt-16 min-h-screen p-4 lg:p-8">
      <div className="pb-4">
        <Title variant="secondaryBold" size="xxxl">
          Account Management
        </Title>
      </div>
      <div className="inline-block">
        <Button onClick={openForm}>
          <TbUserPlus className="mr-2 text-[18px]" />
          Create Admin Account
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
          <div className="w-full max-w-[400px] animate-fade-down px-4 animate-duration-[400ms] animate-ease-out">
            <SignupAdmin onClose={closeForm} />
          </div>
        </div>
      )}

      <div className="py-4">
        <AdminTable />
      </div>
    </div>
  );
};

export default AccountManagement;
