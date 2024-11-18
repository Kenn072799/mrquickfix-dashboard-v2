import React, { useEffect, useState } from "react";
import { Title } from "../props/Title";
import dayjs from "dayjs";
import { useAdminData } from "../../data/AdminData";

const AdminTable = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAllAdmins } = useAdminData();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const fetchedAdmins = await getAllAdmins();
        if (fetchedAdmins) {
          setAdmins(fetchedAdmins);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchAdmins();
  }, [getAllAdmins]);

  return (
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
              <th className="min-w-[150px]">First Name</th>
              <th className="min-w-[150px]">Last Name</th>
              <th className="min-w-[230px]">Log In</th>
              <th className="min-w-[230px]">Log Out</th>
              <th className="w-full">Joined Date</th>
              <th className="min-w-[150px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="h-[400px] text-center capitalize">
                  <span className="loading loading-bars loading-lg"></span>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="text-center capitalize">
                  {error}
                </td>
              </tr>
            ) : admins && admins.length > 0 ? (
              admins.map((admin, index) => (
                <tr
                  key={admin._id}
                  className="text-sm uppercase hover:bg-secondary-50"
                >
                  <td>{index + 1}</td>
                  <td>{admin.firstName}</td>
                  <td>{admin.lastName}</td>
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
                  <td className="flex items-center justify-end gap-3"></td>
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
  );
};

export default AdminTable;
