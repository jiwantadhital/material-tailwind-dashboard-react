import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  DocumentIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { Home,Users,Profile, Tables, Notifications, Create_admin } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import {  NotaryDocuments, SopDocuments, PropertyDocuments } from "@/pages/documents";
import { Countries, Services } from "@/pages/basic_settings";
import { ReportList } from "@/pages/reports";
import { Carousel } from "@/pages/documents";
import { RejectedDocuments } from "@/pages/documents";
import { UserDocuments } from "@/pages/documents";
const icon = {
  className: "w-5 h-5 text-inherit",
};
const token = localStorage.getItem('token');

// Function to handle logout
const handleLogout = () => {
  // Remove all localStorage data
  localStorage.clear();
  // Redirect to the sign-in page
  window.location.href = "/auth/sign-in";
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
        allowedRoles: ["admin", "lawyer",]
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "users",
        path: "/users",
        element: <Users />,
        allowedRoles: ["admin"]
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Create Admin",
        path: "/create-admin",
        element: <Create_admin />,
        allowedRoles: ["admin"]
      },
    ],
  },
  {
    title: "Basic Settings",
    layout: "basicSettings",
    pages: [
     
      {
        icon: <GlobeAltIcon {...icon} />,
        name: "Countries",
        path: "/countries",
        element: <Countries />,
        allowedRoles: ["admin"]
      },
      {
        icon: <BriefcaseIcon {...icon} />,
        name: "Services",
        path: "/services",
        element: <Services />,
        allowedRoles: ["admin"]
      },
      //carousel
    {
      icon: <UserCircleIcon {...icon} />,
      name: "Carousel",
      path: "/mobile/carousel",
      element: <Carousel />,
      allowedRoles: ["admin"]
    },
    ],
  },
  {
    title: "Problem Reports",
    layout: "reports",
    pages: [
     
      {
        icon: <GlobeAltIcon {...icon} />,
        name: "Report List",
        path: "/reports/report_list",
        element: <ReportList />,
        allowedRoles: ["admin"]
      },
      {
        icon: <GlobeAltIcon {...icon} />,
        name: "Rejected Documents",
        path: "/rejected_documents",
        element: <RejectedDocuments />,
        allowedRoles: ["admin"]
      }
    ],
  },
  {
    title: "Documents",
    layout: "documents",
    pages: [
      {
        icon: <DocumentIcon {...icon} />,
        name: "Notary Documents",
        path: "/user_documents",
        element: <UserDocuments code={"NO"}/>,
        allowedRoles: ["admin","lawyer"]
      },
      {
        icon: <DocumentTextIcon {...icon} />,
        name: "SOP Documents",
        path: "/sop_documents",
        element: <SopDocuments />,
        allowedRoles: ["admin","lawyer"]
      },
      {
        icon: <HomeIcon {...icon} />,
        name: "Property Documents",
        path: "/property_documents",
        element: <PropertyDocuments />,
        allowedRoles: ["admin","lawyer"]
      }
    ],
  },
  

  
  {
    title: "auth pages",
    layout: "auth",
    pages: [
     token == null ? {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      } : {
        icon: <ServerStackIcon {...icon} />,
        name: "Logout",
        path: "/sign-in",
        element: <SignIn />,
        onClick: handleLogout,
      },
     
    ],
  },
];

const user = JSON.parse(localStorage.getItem('user')) || { role: null };
const userRole = user.role;

export const filteredRoutes = routes.map(routeGroup => {
  const filteredPages = routeGroup.pages.filter(page => {
    if (!page.allowedRoles) return true;
    return page.allowedRoles.includes(userRole);
  });

  return {
    ...routeGroup,
    pages: filteredPages
  };
}).filter(routeGroup => routeGroup.pages.length > 0);

export default filteredRoutes;
