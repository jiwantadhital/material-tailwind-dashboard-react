import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Avatar,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/apiService";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const TABS = [
    { label: "All Users", value: "all" },
    { label: "Approved", value: "approved" },
    { label: "Pending", value: "pending" },
    { label: "Rejected", value: "rejected" },
  ];

  useEffect(() => {
    fetchUsers('all');
  }, []);

  const fetchUsers = async (status) => {
    try {
      setIsLoading(true);
      const response = await authService.getAllUsers(status);''
      const getAllUsers = response.data.users
        .filter(user => user.role === 'user')
        .map((user) => ({
          ...user,
          kycStatus: user.kyc ? user.kyc.kyc_status : "Not Submitted",
        }));
      setUsers(getAllUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleViewDetails = (user) => {
    navigate("/user_details", { state: { user } });  };
  

  const UsersTable = ({ users }) => (
    <table className="w-full min-w-[640px] table-auto">
      <thead>
        <tr>
          {["Image", "Name", "Phone", "Status", "KYC Status", ""].map((el) => (
            <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
              <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                {el}
              </Typography>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {users.map(({ id, name, phone, status, kycStatus, kyc }, key) => (
          <tr key={id}>
            <td className="py-3 px-5 border-b border-blue-gray-50">
              <Avatar
                src={"http://sajilonotary.xyz/"+ kyc?.photo || "/default-avatar.png"}
                alt={name}
                size="sm"
                className="border border-blue-gray-50 bg-blue-gray-50/50"
              />
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
              <Typography variant="small" color="blue-gray" className="font-semibold">
                {name}
              </Typography>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
              <Typography className="text-xs font-normal text-blue-gray-500">
                {phone}
              </Typography>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
              <Chip
                variant="gradient"
                color={status.toLowerCase() === "active" ? "green" : "red"}
                value={status}
                className="py-0.5 px-2 text-[11px] font-medium w-fit"
              />
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
              <Chip
                variant="gradient"
                color={
                  kycStatus === "approved" ? "green" : 
                  kycStatus === "pending" ? "yellow" : "red"
                }
                value={kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
                className="py-0.5 px-2 text-[11px] font-medium w-fit"
              />
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
              <Button
                variant="gradient"
                color="blue"
                size="sm"
                className="py-1 px-2 text-[11px] font-medium"
                onClick={() => handleViewDetails({ id, name, phone, status, kyc })}
              >
                View Details
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Users Table
          </Typography>
        </CardHeader>
        <CardBody className="px-0 pt-0 pb-2">
          <Tabs value={activeTab} className="px-4">
            <TabsHeader>
              {TABS.map(({ label, value }) => (
                <Tab 
                  key={value} 
                  value={value}
                                  onClick={async () => {
                                    await setActiveTab(value)
                                    fetchUsers(value)
                                  }}
                >
                  {label}
                </Tab>
              ))}
            </TabsHeader>
            <TabsBody>
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Typography>Loading users...</Typography>
                </div>
              ) : (
                <div className="overflow-x-scroll">
                  <UsersTable users={users} />
                </div>
              )}
            </TabsBody>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}