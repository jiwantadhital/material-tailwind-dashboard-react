import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Button,
} from "@material-tailwind/react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Admin Created",
      message: "A new admin user 'John Doe' has been created",
      timestamp: "2 hours ago",
      type: "info",
      read: false,
    },
    {
      id: 2, 
      title: "Account Status Updated",
      message: "Admin user 'Jane Smith' has been deactivated",
      timestamp: "5 hours ago",
      type: "warning",
      read: false,
    },
    {
      id: 3,
      title: "System Update",
      message: "The system will undergo maintenance in 2 hours",
      timestamp: "1 day ago", 
      type: "error",
      read: true,
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? {...notification, read: true} : notification
    ));
  };

  const getChipColor = (type) => {
    switch(type) {
      case "info":
        return "blue";
      case "warning":
        return "amber";
      case "error":
        return "red";
      default:
        return "blue-gray";
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Notifications
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <div className="px-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 border-b border-blue-gray-50 ${
                  notification.read ? 'bg-blue-gray-50/10' : 'bg-blue-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <Typography 
                        variant="small" 
                        color="blue-gray"
                        className="font-semibold"
                      >
                        {notification.title}
                      </Typography>
                      <Typography
                        variant="small"
                        color="gray"
                        className="max-w-sm"
                      >
                        {notification.message}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip
                      variant="ghost"
                      size="sm"
                      value={notification.timestamp}
                      color={getChipColor(notification.type)}
                    />
                    {!notification.read && (
                      <Button
                        variant="text"
                        size="sm"
                        color="blue-gray"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
