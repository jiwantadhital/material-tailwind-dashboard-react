import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Button,
} from "@material-tailwind/react";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export function ReportList() {
  const navigate = useNavigate();

  // Sample data - replace with your actual data
  const reports = [
    {
      id: 1,
      user: "John Doe",
      issue: "Login Authentication Failed",
      status: "pending",
      date: "2024-03-20",
    },
    {
      id: 2,
      user: "Jane Smith",
      issue: "Payment Processing Error",
      status: "resolved",
      date: "2024-03-19",
    },
    // ... existing code ...
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'resolved': return 'green';
      case 'in-progress': return 'blue';
      default: return 'gray';
    }
  };

  

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Reports
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <div className="p-6">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["User", "Issue", "Status", "Date","View"].map((head) => (
                    <th key={head} className="border-b border-blue-gray-50 py-3 px-6 text-left">
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(({ id, user, issue, status, date }, index) => (
                  <tr key={id} className={index % 2 === 0 ? "bg-blue-gray-50/50" : ""}>
                    <td className="py-3 px-6">
                      <Typography className="text-sm font-semibold text-blue-gray-600">
                        {user}
                      </Typography>
                    </td>
                    <td className="py-3 px-6">
                      <Typography className="text-sm text-blue-gray-600">
                        {issue}
                      </Typography>
                    </td>
                    <td className="py-3 px-6">
                      <Chip
                        variant="gradient"
                        color={getStatusColor(status)}
                        value={status}
                        className="py-0.5 px-2 text-[11px] font-medium capitalize"
                      />
                    </td>
                   
                    <td className="py-3 px-6">
                      <Typography className="text-sm text-blue-gray-600">
                        {date}
                      </Typography>
                    </td>
                    <td className="py-3 px-6">
                      <Link to={`/reports/report_details/${id}`}>
                        <Button variant="gradient" color="blue" className="py-0.5 px-2 text-[11px] font-medium capitalize">
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default ReportList;
