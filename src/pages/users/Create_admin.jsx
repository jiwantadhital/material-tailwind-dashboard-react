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
  Option,
  Spinner
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
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
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
      setAlertType("error");
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
    setIsLoadingAdmins(true);
    try {
      const response = await authService.getAllUsers('all');
      const adminUsers = response.data.users.filter(user => user.role === 'lawyer');
      setAdmins(adminUsers);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
      setAlertMessage("Failed to load admin list");
      setAlertType("error");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } finally {
      setIsLoadingAdmins(false);
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
    
    // Check if at least one service is selected
    if (!adminData.services || adminData.services.length === 0) {
      setAlertType("error");
      setAlertMessage("Please select at least one service for the admin.");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }
    
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
      console.error("Full error object:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      
      setAlertType("error");
      
      let errorMessage = "Failed to create admin";
      
      // Check different possible error structures
      if (error.error && typeof error.error === 'object') {
        // Case 1: Validation errors in error.error (direct structure)
        const validationErrors = error.error;
        const errorMessages = [];
        
        Object.keys(validationErrors).forEach(field => {
          if (Array.isArray(validationErrors[field])) {
            validationErrors[field].forEach(message => {
              errorMessages.push(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`);
            });
          }
        });
        
        errorMessage = errorMessages.join('\n') || "Validation failed";
      } else if (error.response?.data?.error) {
        // Case 2: Validation errors in error.response.data.error
        const validationErrors = error.response.data.error;
        const errorMessages = [];
        
        Object.keys(validationErrors).forEach(field => {
          if (Array.isArray(validationErrors[field])) {
            validationErrors[field].forEach(message => {
              errorMessages.push(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`);
            });
          }
        });
        
        errorMessage = errorMessages.join('\n') || "Validation failed";
      } else if (error.response?.data?.message) {
        // Case 3: Error message in error.response.data.message
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // Case 4: Error message in error.message
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        // Case 5: Error is a string
        errorMessage = error;
      }
      
      console.log("Final error message:", errorMessage);
      setAlertMessage(errorMessage);
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
      photo: admin.kyc?.photo_url,
      dob: admin.kyc?.dob,
      address: admin.kyc?.address,
      gender: admin.kyc?.gender,
      password: "",
      password_confirmation: "",
      services: admin.services ? admin.services.map(id => String(id)) : []
    });
    setImagePreview(admin.kyc?.photo_url);
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

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-center space-x-4 py-4">
            <div className="rounded-full bg-gray-300 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-gray-300 rounded w-16"></div>
            <div className="h-8 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Alert Message */}
      {showAlert && (
        <div className={`fixed top-4 right-4 z-50 ${alertType === "success" ? "bg-green-50 border-l-4 border-green-400 text-green-700" : "bg-red-50 border-l-4 border-red-400 text-red-700"} px-6 py-4 rounded-lg shadow-lg flex items-center max-w-md`}>
          <div className="mr-3">
            {alertType === "success" ? (
              <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <Typography className="font-medium whitespace-pre-line text-sm">
              {alertMessage}
            </Typography>
          </div>
          <button 
            onClick={() => setShowAlert(false)} 
            className={`ml-4 ${alertType === "success" ? "text-green-400 hover:text-green-600" : "text-red-400 hover:text-red-600"} transition-colors`}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h4" color="blue-gray" className="mb-2">
                Admin Management
              </Typography>
              <Typography color="gray" className="text-sm">
                Create and manage admin accounts with assigned services
              </Typography>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-blue-50 px-3 py-1 rounded-full">
                <Typography variant="small" color="blue" className="font-medium">
                  {admins.length} Admin{admins.length !== 1 ? 's' : ''}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Create Admin Button */}
        <div className="mb-8">
          <Button 
            onClick={toggleForm} 
            color={isFormOpen ? "red" : "blue"} 
            variant="gradient"
            className="flex items-center justify-center gap-3 py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            {isFormOpen ? (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close Form
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Admin
              </>
            )}
          </Button>
        </div>

        {/* Create Admin Form */}
        {isFormOpen && (
          <Card className="mb-8 shadow-xl border-0">
            <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <Typography variant="h6" color="white">
                  Create New Admin
                </Typography>
              </div>
            </CardHeader>
            <CardBody className="px-8 pt-0 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Typography variant="small" color="blue-gray" className="mb-3 font-semibold">
                      Admin Name <span className="text-red-500">*</span>
                    </Typography>
                    <Input
                      size="lg"
                      type="text"
                      name="name"
                      placeholder="Enter full name"
                      value={adminData.name}
                      onChange={handleChange}
                      required
                      className="!border-t-blue-gray-200 focus:!border-t-blue-500"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                    />
                  </div>

                  <div>
                    <Typography variant="small" color="blue-gray" className="mb-3 font-semibold">
                      Phone Number <span className="text-red-500">*</span>
                    </Typography>
                    <Input
                      size="lg"
                      type="text"
                      name="phone"
                      placeholder="Enter phone number"
                      value={adminData.phone}
                      onChange={handleChange}
                      required
                      maxLength={10}
                      className="!border-t-blue-gray-200 focus:!border-t-blue-500"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                    />
                  </div>

                  <div>
                    <Typography variant="small" color="blue-gray" className="mb-3 font-semibold">
                      Email Address <span className="text-red-500">*</span>
                    </Typography>
                    <Input
                      size="lg"
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      value={adminData.email}
                      onChange={handleChange}
                      required
                      className="!border-t-blue-gray-200 focus:!border-t-blue-500"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                    />
                  </div>

                  <div>
                    <Typography variant="small" color="blue-gray" className="mb-3 font-semibold">
                      Date of Birth <span className="text-red-500">*</span>
                    </Typography>
                    <Input
                      size="lg"
                      type="date"
                      name="dob"
                      value={adminData.dob}
                      onChange={handleChange}
                      required
                      className="!border-t-blue-gray-200 focus:!border-t-blue-500"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                    />
                  </div>

                  <div>
                    <Typography variant="small" color="blue-gray" className="mb-3 font-semibold">
                      Gender <span className="text-red-500">*</span>
                    </Typography>
                    <select
                      name="gender"
                      value={adminData.gender}
                      onChange={handleChange}
                      required
                      className="w-full h-11 border border-blue-gray-200 rounded-lg px-3 focus:border-blue-500 focus:outline-none text-sm"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Typography variant="small" color="blue-gray" className="mb-3 font-semibold">
                      Password <span className="text-red-500">*</span>
                    </Typography>
                    <Input
                      size="lg"
                      type="password"
                      name="password"
                      placeholder="Enter password"
                      value={adminData.password}
                      onChange={handleChange}
                      required
                      className="!border-t-blue-gray-200 focus:!border-t-blue-500"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Typography variant="small" color="blue-gray" className="mb-3 font-semibold">
                    Address <span className="text-red-500">*</span>
                  </Typography>
                  <Input
                    size="lg"
                    type="text"
                    name="address"
                    placeholder="Enter complete address"
                    value={adminData.address}
                    onChange={handleChange}
                    required
                    className="!border-t-blue-gray-200 focus:!border-t-blue-500"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>

                <div>
                  <Typography variant="small" color="blue-gray" className="mb-3 font-semibold">
                    Assign Services <span className="text-red-500">*</span>
                    <span className="text-blue-500 ml-2 font-normal">(Select multiple services)</span>
                  </Typography>
                  <div className="relative">
                    <Select
                      size="lg"
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
                          <div className="flex items-center gap-2 text-blue-gray-700">
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
                      className="!border-t-blue-gray-200 focus:!border-t-blue-500"
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
                            className="p-3 hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="font-medium">{service.name}</span>
                            </div>
                          </Option>
                        ))
                      )}
                    </Select>
                  </div>
                  
                  {adminData.services && adminData.services.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <Typography variant="small" color="blue-gray" className="mb-3 font-semibold">
                        Selected Services:
                      </Typography>
                      <div className="flex flex-wrap gap-2">
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
                              className="rounded-full py-1.5 px-3"
                              onClose={() => {
                                const updatedServices = adminData.services.filter(
                                  id => String(id) !== String(serviceId)
                                );
                                setAdminData(prevData => ({
                                  ...prevData,
                                  services: updatedServices
                                }));
                              }}
                            />
                          );
                        })}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <Typography variant="small" color="gray" className="font-medium">
                          {adminData.services.length} of {availableServices.length} services selected
                        </Typography>
                        <Button 
                          color="red" 
                          size="sm" 
                          variant="text"
                          className="px-3 py-1"
                          onClick={() => {
                            setAdminData(prev => ({ ...prev, services: [] }));
                          }}
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Typography variant="small" color="blue-gray" className="mb-3 font-semibold">
                    Profile Image <span className="text-red-500">*</span>
                  </Typography>
                  <Input
                    size="lg"
                    type="file"
                    name="photo"
                    onChange={handleChange}
                    accept="image/*"
                    required
                    className="!border-t-blue-gray-200 focus:!border-t-blue-500"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                  {imagePreview && (
                    <div className="mt-4 flex justify-center">
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-blue-gray-200 shadow-md"
                        />
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-blue-gray-100">
                  <Button 
                    type="submit" 
                    color="blue" 
                    variant="gradient"
                    className="flex items-center justify-center gap-3 py-3 px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                    fullWidth
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="h-5 w-5" />
                        Creating Admin...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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

        {/* Admin List */}
        <Card className="shadow-xl border-0">
          <CardHeader variant="gradient" color="blue-gray" className="mb-8 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <Typography variant="h6" color="white">
                  Admin List
                </Typography>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <Typography variant="small" color="white" className="font-medium">
                  Total: {admins.length}
                </Typography>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-0 pt-0 pb-2">
            {isLoadingAdmins ? (
              <div className="px-8">
                <LoadingSkeleton />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] table-auto">
                  <thead>
                    <tr className="border-b border-blue-gray-100">
                      {["Profile", "Name", "Phone", "Email", "Status", "Actions"].map((el) => (
                        <th
                          key={el}
                          className="py-4 px-6 text-left bg-blue-gray-50/50"
                        >
                          <Typography
                            variant="small"
                            className="text-xs font-bold uppercase text-blue-gray-600 tracking-wider"
                          >
                            {el}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(admins) && admins.length > 0 ? (
                      admins.map((admin, index) => {
                        const isLast = index === admins.length - 1;
                        const className = `py-4 px-6 ${isLast ? "" : "border-b border-blue-gray-50"}`;

                        return (
                          <tr key={admin.id} className="hover:bg-blue-gray-50/50 transition-colors">
                            <td className={className}>
                              <div className="flex items-center gap-3">
                                <Avatar
                                  src={admin.kyc?.photo_url || "/default-avatar.png"}
                                  alt={admin.name}
                                  size="md"
                                  className="border-2 border-blue-gray-50 shadow-md"
                                />
                              </div>
                            </td>
                            <td className={className}>
                              <div>
                                <Typography
                                  variant="small"
                                  color="blue-gray"
                                  className="font-semibold"
                                >
                                  {admin.name}
                                </Typography>
                                <Typography
                                  variant="small"
                                  color="blue-gray"
                                  className="font-normal opacity-70"
                                >
                                  ID: {admin.id}
                                </Typography>
                              </div>
                            </td>
                            <td className={className}>
                              <div className="flex items-center gap-2">
                                <svg className="h-4 w-4 text-blue-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <Typography className="text-sm font-medium text-blue-gray-600">
                                  {admin.phone || "N/A"}
                                </Typography>
                              </div>
                            </td>
                            <td className={className}>
                              <div className="flex items-center gap-2">
                                <svg className="h-4 w-4 text-blue-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                                <Typography className="text-sm font-medium text-blue-gray-600">
                                  {admin.kyc?.email || "N/A"}
                                </Typography>
                              </div>
                            </td>
                            <td className={className}>
                              <div className="flex items-center gap-3">
                                <Switch
                                  id={`status-${admin.id}`}
                                  checked={admin.status?.toLowerCase() === "active"}
                                  onChange={(e) => handleStatusChange(e.target.checked, admin.id)}
                                  disabled={isUpdatingStatus}
                                  className="h-full w-full checked:bg-blue-500"
                                  containerProps={{
                                    className: "w-11 h-6",
                                  }}
                                  circleProps={{
                                    className: "before:hidden left-0.5 border-none",
                                  }}
                                />
                                <Typography
                                  variant="small"
                                  className={`font-medium ${
                                    admin.status?.toLowerCase() === "active" 
                                      ? "text-green-600" 
                                      : "text-red-600"
                                  }`}
                                >
                                  {admin.status?.toLowerCase() === "active" ? "Active" : "Inactive"}
                                </Typography>
                              </div>
                            </td>
                            <td className={className}>
                              <Button
                                variant="gradient"
                                color="blue"
                                size="sm"
                                className="flex items-center gap-2 py-2 px-4 shadow-md hover:shadow-lg transition-all duration-300"
                                onClick={() => handleEdit(admin)}
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <svg className="h-16 w-16 text-blue-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <Typography variant="h6" color="blue-gray" className="font-medium">
                              No admins found
                            </Typography>
                            <Typography color="gray" className="text-sm">
                              Create your first admin to get started
                            </Typography>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
