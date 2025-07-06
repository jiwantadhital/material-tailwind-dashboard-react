import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
  projectsTableData,
  ordersOverviewData,
} from "@/data";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import { CurrencyDollarIcon, UserGroupIcon, DocumentTextIcon, BriefcaseIcon } from "@heroicons/react/24/solid";
import { authService } from "@/services/apiService";

export function Home() {
  console.log("Dashboard Home component is being rendered", new Date().toISOString());
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    console.log("Fetching dashboard data...");
    try {
      const response = await authService.getDashboardData();
      console.log("Dashboard data response:", response);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    console.log("dashboardData", dashboardData);
    fetchDashboardData();
  }, []);

  const handleCardClick = (cardTitle) => {
    if (cardTitle === "Total Lawyers") {
      navigate("/lawyer-revenue");
    }
  };

  const dashboardStats = [
    {
      color: "blue",
      icon: UserGroupIcon,
      title: "Total Users",
      value: dashboardData?.totalUsers || "0",
      footer: null,
      clickable: false,
    },
    {
      color: "pink",
      icon: BriefcaseIcon,
      title: "Total Lawyers",
      value: dashboardData?.totalLawyers || "0",
      footer: "Click to view revenue details →",
      clickable: true,
    },
    {
      color: "green",
      icon: CurrencyDollarIcon,
      title: "Actual Income",
      value: `Rs. ${dashboardData?.payments?.totalIncome || "0.00"}`,
      footer: {
        color: "text-green-500",
        value: "Received payments",
        label: "from completed & partial payments"
      },
      clickable: false,
    },
    {
      color: "amber",
      icon: CurrencyDollarIcon,
      title: "Potential Income",
      value: `Rs. ${dashboardData?.payments?.potentialIncome || "0.00"}`,
      footer: {
        color: "text-amber-500",
        value: "Expected total",
        label: "when all payments complete"
      },
      clickable: false,
    },
    {
      color: "purple",
      icon: CurrencyDollarIcon,
      title: "Company Profit",
      value: `Rs. ${dashboardData?.doctypePricing?.profit || "0.00"}`,
      footer: null,
      clickable: false,
    },
    {
      color: "orange",
      icon: DocumentTextIcon,
      title: "Total Services",
      value: dashboardData?.totalServices || "0",
      footer: null,
      clickable: false,
    },
  ];



  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map(({ icon, title, value, color, clickable }) => (
          <div
            key={title}
            onClick={clickable ? () => handleCardClick(title) : undefined}
            className={clickable ? "cursor-pointer transform hover:scale-105 transition-transform duration-200" : ""}
          >
            <StatisticsCard
              color={color}
              value={value}
              title={title}
              icon={React.createElement(icon, {
                className: "w-6 h-6 text-white",
              })}
            />
          </div>
        ))}
      </div>
      {/* Services Overview Section */}
      <div className="mb-12">
        <Card>
          <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
            <Typography variant="h6" color="white">
              Services Performance Overview
            </Typography>
            <Typography variant="small" color="white" className="opacity-80">
              Document counts, earnings, and company profit by service
            </Typography>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {dashboardData?.documentsData && Object.entries(dashboardData.documentsData).map(([serviceCode, serviceData]) => (
                <Card key={serviceCode} className="border border-blue-gray-100 shadow-lg">
                  <CardBody className="p-6">
                    <div className="mb-4">
                      <Typography variant="h5" color="blue-gray" className="font-bold">
                        {serviceData.service_name}
                      </Typography>
                      <Typography variant="small" color="blue-gray" className="opacity-60">
                        Service Code: {serviceCode}
                      </Typography>
                    </div>
                    
                    {/* Document Statistics */}
                    <div className="mb-6">
                      <Typography variant="h6" color="blue-gray" className="mb-3">
                        Document Statistics
                      </Typography>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <Typography variant="small" color="blue" className="font-medium">
                            Total Documents
                          </Typography>
                          <Typography variant="h6" color="blue-gray">
                            {serviceData.total_documents || 0}
                          </Typography>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <Typography variant="small" color="green" className="font-medium">
                            Completed
                          </Typography>
                          <Typography variant="h6" color="green">
                            {serviceData.completed || 0}
                          </Typography>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <Typography variant="small" color="orange" className="font-medium">
                            In Progress
                          </Typography>
                          <Typography variant="h6" color="orange">
                            {serviceData.in_progress || 0}
                          </Typography>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <Typography variant="small" color="yellow" className="font-medium">
                            Pending
                          </Typography>
                          <Typography variant="h6" color="yellow">
                            {serviceData.pending || 0}
                          </Typography>
                        </div>
                      </div>
                    </div>
                    
                    {/* Financial Statistics */}
                    <div>
                      <Typography variant="h6" color="blue-gray" className="mb-3">
                        Financial Performance
                      </Typography>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <Typography variant="small" color="purple" className="font-medium">
                            Total Revenue
                          </Typography>
                          <Typography variant="h6" color="purple">
                            Rs. {serviceData.total_revenue || "0.00"}
                          </Typography>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <Typography variant="small" color="green" className="font-medium">
                            Lawyer Earnings
                          </Typography>
                          <Typography variant="h6" color="green">
                            Rs. {serviceData.total_lawyer_earnings || "0.00"}
                          </Typography>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                          <Typography variant="small" color="indigo" className="font-medium">
                            Company Profit
                          </Typography>
                          <Typography variant="h6" color="indigo">
                            Rs. {serviceData.total_company_profit || "0.00"}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
            
            {(!dashboardData?.documentsData || Object.keys(dashboardData.documentsData).length === 0) && (
              <div className="text-center py-8">
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  No service data available
                </Typography>
                <Typography variant="small" color="blue-gray" className="opacity-60">
                  Service performance data will appear here once documents are processed
                </Typography>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;
