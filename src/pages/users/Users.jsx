import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Avatar,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/apiService";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authService.getAllUsers();
        const getAllUsers = response.data.users
          .filter(user => user.role === 'user')
          .map((user) => ({
            ...user,
            kycStatus: user.kyc ? user.kyc.kyc_status : "Not Submitted",
          }));
        setUsers(getAllUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleViewDetails = (user) => {
    navigate("/user_details", { state: { user } });  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Users Table
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Image", "Name", "Phone", "Status", "KYC Status", ""].map((el) => (
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
              {users.map(({ id, name, phone, status, kycStatus, kyc }, key) => {
                const className = `py-3 px-5 ${
                  key === users.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                }`;

                return (
                  <tr key={id}>
                    <td className={className}>
                      <Avatar
                        src={"http://localhost:8000/"+ kyc?.photo || "/default-avatar.png"}
                        alt={name}
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
                        {name}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        {phone}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Chip
                        variant="gradient"
                        color={status.toLowerCase() === "active" ? "green" : "red"}
                        value={status}
                        className="py-0.5 px-2 text-[11px] font-medium w-fit"
                      />
                    </td>
                    <td className={className}>
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
                    <td className={className}>
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
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}