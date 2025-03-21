import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  Chip,
  Avatar
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
    password_confirmation: ""
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [user, setUser] = useState(null);






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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call the createAdmin function from authService with FormData
       const response = await authService.createAdmin(adminData);
      if(response.success){
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
        password: ""
      });
      setImagePreview(null);
      }
      else{
        setAlertMessage(response.message);
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      // Optionally, handle the error (e.g., show a notification)
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
      phone: admin.phone, // Assuming this is the phone number
      photo: admin.kyc?.photo, // Assuming this is the photo URL
      dob: admin.kyc?.dob, // Add this if dob is available in admin object
      address: admin.kyc?.address, // Add this if address is available in admin object
      gender: admin.kyc?.gender, // Add this if gender is available in admin object
      password: "", // Keep this empty for security
      password_confirmation: "", // Keep this empty for security
    });
    setImagePreview(admin.kyc?.photo); // Set the image preview if available
    setIsFormOpen(true); // Open the form for editing
  };

  if (!admins) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {showAlert && (
        <div className="alert">
          <Typography variant="small" color="red">
            {alertMessage}
          </Typography>
        </div>
      )}
      <div className="mt-12 mb-8 flex flex-col gap-12">
        <Button onClick={toggleForm} color="blue" fullWidth>
          {isFormOpen ? "Close Form" : "Open Form"}
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
                  <Button type="submit" color="blue" fullWidth>
                    Create Admin
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
