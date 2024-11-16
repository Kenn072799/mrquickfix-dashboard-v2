import React, { useEffect, useState } from "react";
import { Title } from "../components/props/Title";
import MainTable from "../components/table/MainTable";
import AddJobOrderForm from "../components/form/AddJobOrderForm";
import { Button } from "../components/props/button";
import ViewOnProcess from "../components/form/ViewOnProcess";

// icons
import { TbPlus } from "react-icons/tb";
import InquiryTable from "../components/table/InquiryTable";

const TrackJobOrder = () => {
  const [toggleAddJobOrderForm, setToggleAddJobOrderForm] = useState(false);
  const [selectedJobOrder, setSelectedJobOrder] = useState(null);
  const [jobOrderData, setJobOrderData] = useState({});

  useEffect(() => {
    document.title = "Mr. Quick Fix | Track Job Order";
  }, []);

  const setNewJobOrder = (newJobOrder) => {
    setJobOrderData(newJobOrder);
  };

  const selectJobOrder = (order) => {
    setSelectedJobOrder(order);
    document.body.style.overflow = "hidden";
  };

  const openForm = () => {
    setToggleAddJobOrderForm(!toggleAddJobOrderForm);
    document.body.style.overflow = "hidden";
  };

  const closeForm = () => {
    setToggleAddJobOrderForm(!toggleAddJobOrderForm);
    document.body.style.overflow = "auto";
  };

  const closeViewForm = () => {
    setSelectedJobOrder(!selectedJobOrder);
    document.body.style.overflow = "auto";
  };

  return (
    <div className="mt-16 min-h-screen p-4 lg:p-8">
      <div className="pb-4">
        <Title variant="secondaryBold" size="xxxl">
          Track Job Order
        </Title>
      </div>
      <div className="flex max-w-[150px] pb-4">
        <Button onClick={() => openForm(!toggleAddJobOrderForm)}>
          <TbPlus className="mr-2 text-[18px]" /> Add Job Order
        </Button>
      </div>

      {/* Main Table */}
      <div className="shadow-md shadow-secondary-100">
        <MainTable setSelectedJobOrder={selectJobOrder} />
      </div>

      <div className=""></div>

      <div className="shadow-md mt-8 shadow-secondary-100">
        <InquiryTable />
      </div>

      {/* Add Job Order Form */}
      {toggleAddJobOrderForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
          <div className="animate-fade-down animate-duration-[400ms] animate-ease-out">
            <AddJobOrderForm onClose={() => closeForm(false)} />
          </div>
        </div>
      )}

      {/* View and Edit Form */}
      {selectedJobOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
          <div className="animate-fade-down animate-duration-[400ms] animate-ease-out">
            <ViewOnProcess
              onClose={() => closeViewForm(false)}
              jobOrder={selectedJobOrder}
              setNewJobOrder={setNewJobOrder}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackJobOrder;
