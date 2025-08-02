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
  IconButton,
  Select,
  Option,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/apiService";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
    has_more_pages: false,
  });

  const TABS = [
    { label: "All Users", value: "all" },
    { label: "Approved", value: "approved" },
    { label: "Pending", value: "pending" },
    { label: "Rejected", value: "rejected" },
  ];

  useEffect(() => {
    fetchUsers('all', 1);
  }, []);

  const fetchUsers = async (status, page = 1) => {
    try {
      setIsLoading(true);
      const response = await authService.getAllUsers(status, page, perPage);
      const getAllUsers = response.data.users
        .filter(user => user.role === 'user')
        .map((user) => ({
          ...user,
          kycStatus: user.kyc ? user.kyc.kyc_status : "Not Submitted",
        }));
      setUsers(getAllUsers);
      setPagination(response.data.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (user) => {
    navigate("/user_details", { state: { user } });
  };

  const handlePageChange = (page) => {
    fetchUsers(activeTab, page);
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    fetchUsers(activeTab, 1); // Reset to first page when changing per page
  };

  const handleTabChange = async (value) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page when changing tabs
    await fetchUsers(value, 1);
  };
  

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
                src={ kyc?.photo_url || "/default-avatar.png"}
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

  // Pagination component
  const Pagination = () => {
    const totalPages = pagination.last_page;
    const currentPageNum = pagination.current_page;
    
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPageNum <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPageNum >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPageNum - 1; i <= currentPageNum + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-t border-blue-gray-50 bg-gray-50/50">
        {/* Results Info and Items Per Page */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Typography variant="small" color="blue-gray" className="font-medium">
            Showing <span className="font-semibold text-blue-gray-800">{pagination.from || 0}</span> to{" "}
            <span className="font-semibold text-blue-gray-800">{pagination.to || 0}</span> of{" "}
            <span className="font-semibold text-blue-gray-800">{pagination.total || 0}</span> results
          </Typography>
          
          {/* Items Per Page - Much Better Design */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-blue-gray-200 shadow-sm">
            <Typography variant="small" color="blue-gray" className="font-medium whitespace-nowrap">
              Items per page:
            </Typography>
            <Select
              value={perPage.toString()}
              onChange={(value) => handlePerPageChange(parseInt(value))}
              className="min-w-[80px] !border-blue-gray-200 focus:!border-blue-500"
              containerProps={{
                className: "min-w-[80px]"
              }}
              labelProps={{
                className: "hidden"
              }}
              menuProps={{
                className: "bg-white border border-blue-gray-200 shadow-lg"
              }}
            >
              <Option value="10" className="hover:bg-blue-50 focus:bg-blue-50">10</Option>
              <Option value="15" className="hover:bg-blue-50 focus:bg-blue-50">15</Option>
              <Option value="25" className="hover:bg-blue-50 focus:bg-blue-50">25</Option>
              <Option value="50" className="hover:bg-blue-50 focus:bg-blue-50">50</Option>
            </Select>
          </div>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <IconButton
            variant="outlined"
            size="sm"
            onClick={() => handlePageChange(currentPageNum - 1)}
            disabled={currentPageNum === 1}
            className="border-blue-gray-200 text-blue-gray-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </IconButton>
          
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <Typography variant="small" color="blue-gray" className="px-2 py-1">
                  ...
                </Typography>
              ) : (
                <IconButton
                  variant={page === currentPageNum ? "filled" : "outlined"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={
                    page === currentPageNum 
                      ? "bg-blue-500 text-white border-blue-500 shadow-md" 
                      : "border-blue-gray-200 text-blue-gray-600 hover:bg-blue-50"
                  }
                >
                  {page}
                </IconButton>
              )}
            </React.Fragment>
          ))}
          
          <IconButton
            variant="outlined"
            size="sm"
            onClick={() => handlePageChange(currentPageNum + 1)}
            disabled={currentPageNum === totalPages}
            className="border-blue-gray-200 text-blue-gray-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </IconButton>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <Typography variant="h6" color="white">
              Users Table
            </Typography>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <Typography variant="small" color="white" className="font-medium">
                Total: {pagination.total || users.length}
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-0 pt-0 pb-2">
          <Tabs value={activeTab} className="px-4">
            <TabsHeader>
              {TABS.map(({ label, value }) => (
                <Tab 
                  key={value} 
                  value={value}
                  onClick={() => handleTabChange(value)}
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
                <>
                  <div className="overflow-x-scroll">
                    <UsersTable users={users} />
                  </div>
                  {pagination.total > 0 && <Pagination />}
                </>
              )}
            </TabsBody>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}