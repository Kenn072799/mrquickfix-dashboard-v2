const useService = () => {
    const servicesList = {
        Repairs: [
          "Fits-outs (Painting, Carpentry, Masonry)",
          "Door and Window Repairs", 
          "Electrical Works",
        ],
        Renovation: [
          "Fits-outs (Painting, Carpentry, Masonry)",
          "Kitchen and Bath Renovation",
          "Outdoor and Landscaping",
        ],
        "Preventive Maintenance Service (PMS)": ["Aircon Services"],
        "Cleaning Services": ["Household Cleaning Services"],
    };

    return { servicesList };
};

export default useService;
