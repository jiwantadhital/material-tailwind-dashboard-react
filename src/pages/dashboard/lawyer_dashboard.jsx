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
  Button,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { authService } from "@/services/apiService";

export function LawyerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since this is static
      // Later you can create a specific API endpoint for lawyer dashboard
      const mockData = {
        assignedDocuments: 12,
        completedDocuments: 8,
        pendingDocuments: 4,
        totalEarnings: 45000,
        thisMonthEarnings: 12000,
        averageRating: 4.8,
        totalReviews: 24,
        recentDocuments: [
          {
            id: 1,
            title: "Property Registration Document",
            status: "completed",
            date: "2024-01-15",
            amount: 5000
          },
          {
            id: 2,
            title: "Notary Service Document",
            status: "pending",
            date: "2024-01-14",
            amount: 3000
          },
          {
            id: 3,
            title: "SOP Document Review",
            status: "in_progress",
            date: "2024-01-13",
            amount: 4000
          }
        ]
      };
      
      setDashboardData(mockData);
    } catch (error) {
      console.error("Error fetching lawyer dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'in_progress':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const lawyerStats = [
    {
      color: "blue",
      icon: DocumentTextIcon,
      title: "Assigned Documents",
      value: dashboardData?.assignedDocuments || "0",
      footer: (
        <div className="flex items-center gap-2">
          <Typography variant="small" className="text-blue-500 font-medium">
            Active cases
          </Typography>
          <Typography variant="small" className="text-blue-gray-500">
            currently assigned to you
          </Typography>
        </div>
      ),
    },
    {
      color: "green",
      icon: CheckCircleIcon,
      title: "Completed Documents",
      value: dashboardData?.completedDocuments || "0",
      footer: (
        <div className="flex items-center gap-2">
          <Typography variant="small" className="text-green-500 font-medium">
            Successfully completed
          </Typography>
          <Typography variant="small" className="text-blue-gray-500">
            documents this month
          </Typography>
        </div>
      ),
    },
    {
      color: "amber",
      icon: CurrencyDollarIcon,
      title: "Total Earnings",
      value: `Rs. ${dashboardData?.totalEarnings?.toLocaleString() || "0"}`,
      footer: (
        <div className="flex items-center gap-2">
          <Typography variant="small" className="text-amber-500 font-medium">
            Lifetime earnings
          </Typography>
          <Typography variant="small" className="text-blue-gray-500">
            from all completed work
          </Typography>
        </div>
      ),
    },
    {
      color: "purple",
      icon: ChartBarIcon,
      title: "Average Rating",
      value: dashboardData?.averageRating || "0.0",
      footer: (
        <div className="flex items-center gap-2">
          <Typography variant="small" className="text-purple-500 font-medium">
            {dashboardData?.totalReviews || 0} reviews
          </Typography>
          <Typography variant="small" className="text-blue-gray-500">
            from satisfied clients
          </Typography>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="mt-12 mb-8 flex flex-col gap-12">
        <div className="flex justify-center items-center h-64">
          <Typography variant="h6" color="blue-gray">
            Loading your dashboard...
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h4" color="white" className="mb-2">
                Welcome back, Lawyer!
              </Typography>
              <Typography variant="paragraph" color="white" className="opacity-80">
                Here's an overview of your work and performance
              </Typography>
            </div>
            <div className="text-right">
              <Typography variant="h6" color="white" className="mb-1">
                This Month
              </Typography>
              <Typography variant="h4" color="white" className="font-bold">
                Rs. {dashboardData?.thisMonthEarnings?.toLocaleString() || "0"}
              </Typography>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {lawyerStats.map(({ icon: Icon, ...rest }) => (
          <StatisticsCard
            key={rest.title}
            {...rest}
            icon={<Icon className="h-6 w-6 text-white" />}
          />
        ))}
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader
          variant="gradient"
          color="blue"
          className="mb-8 p-6"
        >
          <div className="flex items-center justify-between">
            <Typography variant="h6" color="white">
              Recent Documents
            </Typography>
            <Button
              variant="text"
              color="white"
              size="sm"
              onClick={() => navigate("/service_documents")}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardBody className="px-0 pt-0 pb-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Document", "Status", "Date", "Amount", "Actions"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-6 text-left"
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
                {dashboardData?.recentDocuments?.map((doc, key) => (
                  <tr key={doc.id}>
                    <td className="py-3 px-6 border-b border-blue-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            {doc.title}
                          </Typography>
                          <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                            ID: {doc.id}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6 border-b border-blue-gray-50">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.status)}
                        <Typography
                          variant="small"
                          className={`font-medium capitalize ${getStatusColor(doc.status)}`}
                        >
                          {doc.status.replace('_', ' ')}
                        </Typography>
                      </div>
                    </td>
                    <td className="py-3 px-6 border-b border-blue-gray-50">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {new Date(doc.date).toLocaleDateString()}
                      </Typography>
                    </td>
                    <td className="py-3 px-6 border-b border-blue-gray-50">
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        Rs. {doc.amount.toLocaleString()}
                      </Typography>
                    </td>
                    <td className="py-3 px-6 border-b border-blue-gray-50">
                      <Button
                        variant="gradient"
                        color="blue"
                        size="sm"
                        className="py-1 px-2 text-[11px] font-medium"
                        onClick={() => navigate(`/service_documents/${doc.id}`)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader variant="gradient" color="green" className="mb-4 p-4">
            <Typography variant="h6" color="white">
              Quick Actions
            </Typography>
          </CardHeader>
          <CardBody className="p-4">
            <div className="space-y-3">
              <Button
                variant="outlined"
                color="blue"
                fullWidth
                onClick={() => navigate("/service_documents")}
                className="flex items-center justify-start gap-3"
              >
                <DocumentTextIcon className="h-5 w-5" />
                View My Documents
              </Button>
              <Button
                variant="outlined"
                color="green"
                fullWidth
                onClick={() => navigate("/profile")}
                className="flex items-center justify-start gap-3"
              >
                <UserGroupIcon className="h-5 w-5" />
                Update Profile
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader variant="gradient" color="purple" className="mb-4 p-4">
            <Typography variant="h6" color="white">
              Performance Summary
            </Typography>
          </CardHeader>
          <CardBody className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Typography variant="small" color="blue-gray" className="font-medium">
                    Completion Rate
                  </Typography>
                  <Typography variant="small" color="blue-gray" className="font-semibold">
                    {dashboardData?.assignedDocuments > 0 
                      ? Math.round((dashboardData.completedDocuments / dashboardData.assignedDocuments) * 100)
                      : 0}%
                  </Typography>
                </div>
                <Progress 
                  value={dashboardData?.assignedDocuments > 0 
                    ? (dashboardData.completedDocuments / dashboardData.assignedDocuments) * 100
                    : 0} 
                  color="green" 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Typography variant="small" color="blue-gray" className="font-medium">
                    Average Processing Time
                  </Typography>
                  <Typography variant="small" color="blue-gray" className="font-semibold">
                    2.5 days
                  </Typography>
                </div>
                <Progress value={75} color="blue" className="h-2" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
} 