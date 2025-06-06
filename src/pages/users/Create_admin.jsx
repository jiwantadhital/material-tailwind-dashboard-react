import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  Chip,
  Avatar,
  Select,
  Option
} from "@material-tailwind/react";
import { authService } from "../../services/apiService";
import { Switch } from "@material-tailwind/react";

export default function Create_admin() {
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    phone: "",
    photo: "",
    dob: "",
    address: "",
    gender: "",
    password: "",
    password_confirmation: "",
    services: []
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);

  const handleStatusChange = async (checked, adminId) => {
    setIsUpdatingStatus(true);
    try {
      const newStatus = checked ? true : false;
      console.log(adminId);
      const response = await authService.activeDeactiveUser(adminId, newStatus);
      
      if (response.success) {
       
        fetchAdmins();
      }
    } catch (error) {
      setAlertMessage(error.message || "Failed to update account status");
      setShowAlert(true);
    } finally {
      setIsUpdatingStatus(false);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  useEffect(() => {
    const storedServices = localStorage.getItem('services');
    console.log("Raw storedServices:", storedServices);
    
    if (storedServices) {
      try {
        const parsedServices = JSON.parse(storedServices);
        console.log("Parsed services:", parsedServices);
        
        // Extract the services array from the response structure
        const servicesArray = parsedServices.data || [];
        console.log("Services array:", servicesArray);
        
        const formattedServices = Array.isArray(servicesArray) 
          ? servicesArray.map(service => ({
              ...service,
              id: String(service.id) // Ensure IDs are strings
            }))
          : [];
          
        console.log("Formatted services:", formattedServices);
        setAvailableServices(formattedServices);
      } catch (error) {
        console.error("Error parsing services from localStorage:", error);
        setAvailableServices([]);
      }
    } else {
      setAvailableServices([]);
    }
    
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await authService.getAllUsers('all');
      const adminUsers = response.data.users.filter(user => user.role === 'lawyer');
      setAdmins(adminUsers);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setAdminData({ ...adminData, [name]: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setAdminData({ ...adminData, [name]: value });
    }
  };

  const handleServiceChange = (value) => {
    console.log("handleServiceChange received value:", value);
    
    // Normalize to an array of string IDs
    let serviceIds = [];
    
    if (value === null || value === undefined) {
      // No selection
      serviceIds = [];
    } else if (Array.isArray(value)) {
      // Multiple selections
      serviceIds = value.map(v => String(v));
    } 
    else if (typeof value === 'object' && value.hasOwnProperty('value')) {
      // Single selection object format
      serviceIds.push(String(value));
    } else {
      // Single selection primitive format
      serviceIds.push(String(value));
    }
    
    console.log("Normalized service IDs:", serviceIds);
    
    setAdminData(prevData => {
      const newState = {
        ...prevData,
        services: serviceIds
      };
      console.log("Updated adminData:", newState);
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Call the createAdmin function from authService with FormData
       const response = await authService.createAdmin(adminData);
      if(response.success){
        setAlertType("success");
        setAlertMessage("Admin created successfully!");
        setShowAlert(true);
        fetchAdmins();
        setIsFormOpen(false);
        setAdminData({
          name: "",
          email: "",
          phone: "",
          photo: "",
          dob: "",
          address: "",
          gender: "",
          password: "",
          services: []
        });
        setImagePreview(null);
      }
      else{
        setAlertType("error");
        setAlertMessage(response.message);
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      setAlertType("error");
      setAlertMessage(error.message || "Failed to create admin");
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const handleEdit = (admin) => {
    setIsFormOpen(true);
    setAdminData({
      name: admin.name,
      email: admin.kyc?.email,
      phone: admin.phone,
      photo: admin.kyc?.photo,
      dob: admin.kyc?.dob,
      address: admin.kyc?.address,
      gender: admin.kyc?.gender,
      password: "",
      password_confirmation: "",
      services: admin.services ? admin.services.map(id => String(id)) : []
    });
    setImagePreview(admin.kyc?.photo);
    setIsFormOpen(true);
  };

  useEffect(() => {
    // Ensure services array is always initialized properly
    setAdminData(prev => {
      if (!prev.services || !Array.isArray(prev.services)) {
        return { ...prev, services: [] };
      }
      return prev;
    });
  }, []);

  if (!admins) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {showAlert && (
        <div className={`fixed top-4 right-4 z-50 ${alertType === "success" ? "bg-green-50 border-green-300 text-green-800" : "bg-red-50 border-red-300 text-red-800"} px-4 py-3 rounded-lg shadow-lg flex items-center`}>
          <div className="mr-2">
            {alertType === "success" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <Typography className="font-medium">
            {alertMessage}
          </Typography>
          <button 
            onClick={() => setShowAlert(false)} 
            className={`ml-4 ${alertType === "success" ? "text-green-500 hover:text-green-700" : "text-red-500 hover:text-red-700"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      <div className="mt-12 mb-8 flex flex-col gap-12">
        <Button 
          onClick={toggleForm} 
          color={isFormOpen ? "red" : "blue"} 
          variant="gradient"
          className="flex items-center justify-center gap-2 py-3"
          fullWidth
        >
          {isFormOpen ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Close Form
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Admin
            </>
          )}
        </Button>

        {isFormOpen && (
          <Card>
            <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
              <Typography variant="h6" color="white">
                Create Admin
              </Typography>
            </CardHeader>
            <CardBody className="px-6 pt-0 pb-2">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    Admin Name
                  </Typography>
                  <Input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={adminData.name}
                    onChange={handleChange}
                    required
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    Phone Number
                  </Typography>
                  <Input
                    type="text"
                    name="phone"
                    placeholder="+1 234 567 8900"
                    value={adminData.phone}
                    onChange={handleChange}
                    required
              maxLength={10}

                    // disabled={ adminData.phone !== ""}
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    Email Address
                  </Typography>
                  <Input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={adminData.email}
                    onChange={handleChange}
                    required
                    // disabled={isFormOpen && adminData.email !== ""}
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    Date of Birth
                  </Typography>
                  <Input
                    type="date"
                    name="dob"
                    value={adminData.dob}
                    onChange={handleChange}
                    required
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>

                <div className="col-span-2">
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    Address
                  </Typography>
                  <Input
                    type="text"
                    name="address"
                    placeholder="123 Street Name, City, Country"
                    value={adminData.address}
                    onChange={handleChange}
                    required
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    Gender
                  </Typography>
                  <select
                    name="gender"
                    value={adminData.gender}
                    onChange={handleChange}
                    required
                    className="w-full h-10 border border-blue-gray-200 rounded-lg px-3 focus:border-gray-900 focus:outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    Services <span className="text-xs text-blue-500 ml-1">(Select multiple)</span>
                  </Typography>
                  <div className="relative">
                    <Select
                      label="Select Services"
                      value={adminData.services || []}
                      onChange={(selectedValue) => {
  console.log("Selected value:", selectedValue);

  // Avoid duplication
  setAdminData((prevData) => {
    const currentServices = prevData.services || [];

    // Toggle selection
    const index = currentServices.indexOf(selectedValue);
    let newServices;

    if (index > -1) {
      // Deselect if already selected
      newServices = currentServices.filter(s => s !== selectedValue);
    } else {
      // Add new selection
      newServices = [...currentServices, selectedValue];
    }

    return {
      ...prevData,
      services: newServices
    };
  });
}}

                      selected={(selectedValues) => {
                        return (
                          <div className="flex items-center gap-2 text-blue-gray-500">
                            {(!selectedValues || selectedValues.length === 0) ? (
                              <span className="text-sm">Select services</span>
                            ) : (
                              <span className="text-sm font-medium">
                                {selectedValues.length} service{selectedValues.length !== 1 ? "s" : ""} selected
                              </span>
                            )}
                          </div>
                        );
                      }}
                      multiple
                      className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                      containerProps={{ className: "min-w-full" }}
                      menuProps={{
                        className: "p-2 max-h-72 overflow-y-auto",
                      }}
                    >
                      {!Array.isArray(availableServices) || availableServices.length === 0 ? (
                        <Option disabled>No services available</Option>
                      ) : (
                        availableServices.map((service) => (
                          <Option 
                            key={service.id} 
                            value={String(service.id)} 
                            className="p-2 flex items-center gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <span>{service.name}</span>
                            </div>
                          </Option>
                        ))
                      )}
                    </Select>
                  </div>
                  
                  {adminData.services && adminData.services.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {adminData.services.map((serviceId) => {
                        const service = availableServices.find(s => String(s.id) === String(serviceId));
                        if (!service) return null;
                        
                        return (
                          <Chip
                            key={serviceId}
                            value={service.name}
                            variant="gradient"
                            color="blue"
                            size="sm"
                            className="rounded-full py-1.5"
                            onClose={() => {
                              const updatedServices = adminData.services.filter(
                                id => String(id) !== String(serviceId)
                              );
                              console.log("Removing service:", serviceId);
                              console.log("Updated services:", updatedServices);
                              
                              setAdminData(prevData => ({
                                ...prevData,
                                services: updatedServices
                              }));
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="flex items-center mt-2">
                    {adminData.services.length > 0 && (
                      <Button 
                        color="red" 
                        size="sm" 
                        variant="text"
                        className="p-1 h-7"
                        onClick={() => {
                          console.log("Clearing all services");
                          setAdminData(prev => ({ ...prev, services: [] }));
                        }}
                      >
                        Clear All
                      </Button>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        color="blue"
                        size="sm"
                        variant="text"
                        className="p-1 h-7"
                        onClick={() => {
                          console.log("Current adminData:", adminData);
                          console.log("Current services:", adminData.services);
                          console.log("Available services:", availableServices);
                        }}
                      >
                        Debug
                      </Button>
                      <Typography variant="small" color="gray">
                        {adminData.services.length} of {availableServices.length} services selected
                      </Typography>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    Password
                  </Typography>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Enter Password"
                    value={adminData.password}
                    onChange={handleChange}
                    required
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    Profile Image
                  </Typography>
                  <Input
                    type="file"
                    name="photo"
                    onChange={handleChange}
                    accept="image/*"
                    required
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <Button 
                    type="submit" 
                    color="blue" 
                    variant="gradient"
                    className="flex items-center justify-center gap-2 mt-4 py-3"
                    fullWidth
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Admin...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        {adminData.id ? "Update Admin" : "Create Admin"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        <div className="mt-8">
          <Typography variant="h6" color="gray">
            Admin List
          </Typography>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Image", "Name", "Phone", "Email", "Status", ""].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.isArray(admins) && admins.map((admin, index) => {
                  const className = `py-3 px-5 ${
                    index === admins.length - 1 ? "" : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={index}>
                      <td className={className}>
                        <Avatar
                          src={"https://sajilonotary.xyz/"+ admin.kyc?.photo || "/default-avatar.png"}
                          alt={admin.photo}
                          size="sm"
                          className="border border-blue-gray-50 bg-blue-gray-50/50"
                        />
                      </td>
                      <td className={className}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {admin.name}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {admin.phone}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {admin.kyc?.email}
                        </Typography>
                      </td>
                      <td className={className}>
                      <Switch
                      id={`status-${admin.id}`}
                      label={`Account ${admin.status?.toLowerCase() === "active" ? "Active" : "Inactive"}`} 
                      checked={admin.status?.toLowerCase() === "active"}
                      onChange={(e) => handleStatusChange(e.target.checked, admin.id)}
                      disabled={isUpdatingStatus}
                      labelProps={{
                        className: "text-sm font-normal text-blue-gray-500",
                      }}
                    />
                      </td>
                      <td className={className}>
                        <Button
                          variant="gradient"
                          color="blue"
                          size="sm"
                          className="py-1 px-2 text-[11px] font-medium"
                          onClick={() => handleEdit(admin)}
                        >
                          Edit
                        </Button>
                      </td>
                     
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </div>
      </div>
    </>
  );
}
