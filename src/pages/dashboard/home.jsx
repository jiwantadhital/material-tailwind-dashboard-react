import React, { useEffect, useState } from "react";
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

  const dashboardStats = [
    {
      color: "blue",
      icon: UserGroupIcon,
      title: "Total Users",
      value: dashboardData?.totalUsers || "0",
      footer: null,
    },
    {
      color: "pink",
      icon: BriefcaseIcon,
      title: "Total Lawyers",
      value: dashboardData?.totalLawyers || "0",
      footer: null,
    },
    {
      color: "green",
      icon: CurrencyDollarIcon,
      title: "Total Income",
      value: `Rs. ${dashboardData?.payments?.totalIncome || "0.00"}`,
      footer: null,
    },
    {
      color: "orange",
      icon: DocumentTextIcon,
      title: "Total Services",
      value: dashboardData?.totalServices || "0",
      footer: null,
    },
  ];

  const documentCharts = [
    {
      color: "white",
      title: "NO Documents",
      description: "Document status distribution",
      footer: "Updated Just Now",
      chart: {
        type: "bar",
        height: 220,
        series: [
          {
            name: "Documents",
            data: [
              dashboardData?.documentsData?.NO?.completed || 0,
              dashboardData?.documentsData?.NO?.pending || 0,
              dashboardData?.documentsData?.NO?.in_progress || 0,
            ],
          },
        ],
        options: {
          chart: {
            toolbar: {
              show: false,
            },
            animations: {
              enabled: true,
              easing: 'easeinout',
              speed: 800,
            },
          },
          colors: ["#4CAF50", "#FF9800", "#2196f3"],
          plotOptions: {
            bar: {
              borderRadius: 8,
              columnWidth: "60%",
              distributed: true,
              dataLabels: {
                position: "top",
              },
            },
          },
          dataLabels: {
            enabled: true,
            formatter: function (val) {
              return val;
            },
            offsetY: -20,
            style: {
              fontSize: "12px",
              colors: ["#333"],
              fontWeight: 600
            }
          },
          xaxis: {
            categories: ['Completed', 'Pending', 'In Progress'],
            axisBorder: {
              show: true,
              color: '#e0e0e0'
            },
            axisTicks: {
              show: false
            },
            labels: {
              style: {
                colors: "#333",
                fontSize: "13px",
                fontWeight: 500
              }
            }
          },
          yaxis: {
            labels: {
              show: true,
              style: {
                colors: "#666",
                fontSize: "12px"
              }
            },
            grid: {
              show: true
            }
          },
          grid: {
            show: true,
            borderColor: '#f0f0f0',
            strokeDashArray: 0,
            position: 'back',
            xaxis: {
              lines: {
                show: false
              }
            },
            yaxis: {
              lines: {
                show: true
              }
            },
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0
            }
          },
          theme: {
            mode: 'light',
            palette: 'palette1',
            monochrome: {
              enabled: false,
              shadeTo: 'light',
              shadeIntensity: 0.65
            }
          }
        },
      },
    },
    {
      color: "white",
      title: "SOP Documents",
      description: "Document status distribution",
      footer: "Updated Just Now",
      chart: {
        type: "bar",
        height: 220,
        series: [
          {
            name: "Documents",
            data: [
              dashboardData?.documentsData?.SOP?.completed || 0,
              dashboardData?.documentsData?.SOP?.pending || 0,
              dashboardData?.documentsData?.SOP?.in_progress || 0,
            ],
          },
        ],
        options: {
          chart: {
            toolbar: {
              show: false,
            },
            animations: {
              enabled: true,
              easing: 'easeinout',
              speed: 800,
            },
          },
          colors: ["#4CAF50", "#FF9800", "#2196f3"],
          plotOptions: {
            bar: {
              borderRadius: 8,
              columnWidth: "60%",
              distributed: true,
              dataLabels: {
                position: "top",
              },
            },
          },
          dataLabels: {
            enabled: true,
            formatter: function (val) {
              return val;
            },
            offsetY: -20,
            style: {
              fontSize: "12px",
              colors: ["#333"],
              fontWeight: 600
            }
          },
          xaxis: {
            categories: ['Completed', 'Pending', 'In Progress'],
            axisBorder: {
              show: true,
              color: '#e0e0e0'
            },
            axisTicks: {
              show: false
            },
            labels: {
              style: {
                colors: "#333",
                fontSize: "13px",
                fontWeight: 500
              }
            }
          },
          yaxis: {
            labels: {
              show: true,
              style: {
                colors: "#666",
                fontSize: "12px"
              }
            },
            grid: {
              show: true
            }
          },
          grid: {
            show: true,
            borderColor: '#f0f0f0',
            strokeDashArray: 0,
            position: 'back',
            xaxis: {
              lines: {
                show: false
              }
            },
            yaxis: {
              lines: {
                show: true
              }
            },
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0
            }
          },
          theme: {
            mode: 'light',
            palette: 'palette1',
            monochrome: {
              enabled: false,
              shadeTo: 'light',
              shadeIntensity: 0.65
            }
          }
        },
      },
    },
  ];

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map(({ icon, title, value, color }) => (
          <StatisticsCard
            key={title}
            color={color}
            value={value}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
          />
        ))}
      </div>
      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2">
        {documentCharts.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>
    </div>
  );
}

export default Home;
