import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Chip,
  Tooltip,
  Progress,
  Button,
  Collapse,
  IconButton,
} from "@material-tailwind/react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import { authService } from "@/services/apiService";
import { useNavigate } from "react-router-dom";

export function LawyerRevenue() {
  const [lawyerData, setLawyerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLawyer, setExpandedLawyer] = useState(null);
  const navigate = useNavigate();

  const fetchLawyerRevenueData = async () => {
    try {
      setLoading(true);
      const response = await authService.getLawyerRevenueData();
      console.log("Lawyer revenue data:", response);
      setLawyerData(response.data || []);
    } catch (error) {
      console.error("Error fetching lawyer revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyerRevenueData();
  }, []);

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const toggleExpanded = (lawyerId) => {
    setExpandedLawyer(expandedLawyer === lawyerId ? null : lawyerId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-blue-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard/home")}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <button
                onClick={() => navigate("/dashboard/home")}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                Dashboard
              </button>
            </div>
            <Typography variant="h5" color="blue-gray" className="font-semibold">
              Lawyer Revenue Performance
            </Typography>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
            <Typography variant="h6" color="white">
              Revenue Analytics & Performance Metrics
            </Typography>
            <Typography variant="small" color="white" className="opacity-80">
              Comprehensive breakdown of lawyer earnings, company profits, and payment tracking
            </Typography>
          </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {lawyerData.length === 0 ? (
            <div className="text-center py-8">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                No lawyer revenue data found
              </Typography>
              <Typography variant="small" color="blue-gray" className="opacity-60">
                No completed documents with assigned lawyers available
              </Typography>
            </div>
          ) : (
            <div className="space-y-4 px-6">
              {lawyerData.map((lawyer, index) => (
                <Card key={lawyer.lawyer_id} className="border border-blue-gray-50">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={`https://ui-avatars.com/api/?name=${lawyer.lawyer_name}&background=random`}
                          alt={lawyer.lawyer_name}
                          size="md"
                        />
                        <div>
                          <Typography variant="h6" color="blue-gray">
                            {lawyer.lawyer_name}
                          </Typography>
                          <Typography variant="small" color="blue-gray" className="opacity-60">
                            {lawyer.lawyer_phone}
                          </Typography>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Typography variant="small" color="blue-gray" className="opacity-60">
                            Total Revenue
                          </Typography>
                          <Typography variant="h6" color="green">
                            {formatCurrency(lawyer.total_revenue)}
                          </Typography>
                        </div>
                        <IconButton
                          variant="text"
                          size="sm"
                          onClick={() => toggleExpanded(lawyer.lawyer_id)}
                        >
                          {expandedLawyer === lawyer.lawyer_id ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </IconButton>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-1" />
                          <Typography variant="small" color="blue-gray" className="opacity-60">
                            Total Docs
                          </Typography>
                        </div>
                        <Typography variant="h6" color="blue-gray">
                          {lawyer.total_documents}
                        </Typography>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <DocumentTextIcon className="h-5 w-5 text-green-500 mr-1" />
                          <Typography variant="small" color="blue-gray" className="opacity-60">
                            Completed
                          </Typography>
                        </div>
                        <Typography variant="h6" color="green">
                          {lawyer.completed_documents || 0}
                        </Typography>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <CurrencyDollarIcon className="h-5 w-5 text-amber-500 mr-1" />
                          <Typography variant="small" color="blue-gray" className="opacity-60">
                            With Payments
                          </Typography>
                        </div>
                        <Typography variant="h6" color="amber">
                          {lawyer.documents_with_payments || 0}
                        </Typography>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <CurrencyDollarIcon className="h-5 w-5 text-green-500 mr-1" />
                          <Typography variant="small" color="blue-gray" className="opacity-60">
                            Lawyer Earnings
                          </Typography>
                        </div>
                        <Typography variant="h6" color="green">
                          {formatCurrency(lawyer.total_lawyer_earnings)}
                        </Typography>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <BriefcaseIcon className="h-5 w-5 text-orange-500 mr-1" />
                          <Typography variant="small" color="blue-gray" className="opacity-60">
                            Company Profit
                          </Typography>
                        </div>
                        <Typography variant="h6" color="orange">
                          {formatCurrency(lawyer.total_company_profit)}
                        </Typography>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <UserGroupIcon className="h-5 w-5 text-purple-500 mr-1" />
                          <Typography variant="small" color="blue-gray" className="opacity-60">
                            Users Served
                          </Typography>
                        </div>
                        <Typography variant="h6" color="purple">
                          {lawyer.processed_users.length}
                        </Typography>
                      </div>
                    </div>

                    <Collapse open={expandedLawyer === lawyer.lawyer_id}>
                      <div className="mt-6 pt-4 border-t border-blue-gray-50">
                        {/* Payment Status Breakdown */}
                        <div className="mb-6">
                          <Typography variant="h6" color="blue-gray" className="mb-4">
                            Payment Status Breakdown
                          </Typography>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                              <Typography variant="small" color="green" className="font-medium">
                                Fully Paid
                              </Typography>
                              <Typography variant="h6" color="green">
                                {lawyer.fully_paid_documents || 0}
                              </Typography>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-lg text-center">
                              <Typography variant="small" color="amber" className="font-medium">
                                Partially Paid
                              </Typography>
                              <Typography variant="h6" color="amber">
                                {lawyer.partially_paid_documents || 0}
                              </Typography>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg text-center">
                              <Typography variant="small" color="red" className="font-medium">
                                Not Paid
                              </Typography>
                              <Typography variant="h6" color="red">
                                {lawyer.total_documents - (lawyer.documents_with_payments || 0)}
                              </Typography>
                            </div>
                          </div>
                        </div>
                        
                        <Typography variant="h6" color="blue-gray" className="mb-4">
                          Assigned Users ({lawyer.processed_users.length})
                        </Typography>
                        {lawyer.processed_users.length === 0 ? (
                          <div className="text-center py-8">
                            <Typography variant="small" color="blue-gray" className="opacity-60">
                              No users assigned to this lawyer yet
                            </Typography>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {lawyer.processed_users.map((user, userIndex) => (
                              <Card key={user.user_id} className="border border-blue-gray-100">
                                <CardBody className="p-4">
                                  <div className="flex items-center gap-3 mb-3">
                                    <Avatar
                                      src={`https://ui-avatars.com/api/?name=${user.user_name}&background=random`}
                                      alt={user.user_name}
                                      size="sm"
                                    />
                                    <div className="flex-1">
                                      <Typography variant="small" color="blue-gray" className="font-medium">
                                        {user.user_name}
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="opacity-60">
                                        {user.user_phone}
                                      </Typography>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                      <Typography variant="small" color="blue-gray" className="opacity-60">
                                        Total
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-medium">
                                        {user.total_documents_count}
                                      </Typography>
                                    </div>
                                    <div>
                                      <Typography variant="small" color="green" className="opacity-60">
                                        Completed
                                      </Typography>
                                      <Typography variant="small" color="green" className="font-medium">
                                        {user.completed_documents_count}
                                      </Typography>
                                    </div>
                                    <div>
                                      <Typography variant="small" color="orange" className="opacity-60">
                                        Pending
                                      </Typography>
                                      <Typography variant="small" color="orange" className="font-medium">
                                        {user.pending_documents_count}
                                      </Typography>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </Collapse>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
      </div>
    </div>
  );
}

export default LawyerRevenue; 