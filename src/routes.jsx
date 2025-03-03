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

const icon = {
  className: "w-5 h-5 text-inherit",
};
const token = localStorage.getItem('token');

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
        {
          icon: <UserCircleIcon {...icon} />,
          name: "users",
          path: "/users",
          element: <Users />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Create Admin",
        path: "/create-admin",
        element: <Create_admin />,
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
      },
      {
        icon: <BriefcaseIcon {...icon} />,
        name: "Services",
        path: "/services",
        element: <Services />,
      },
      //carousel
    {
      icon: <UserCircleIcon {...icon} />,
      name: "Carousel",
      path: "/mobile/carousel",
      element: <Carousel />,
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
        element: <NotaryDocuments />,
      },
      {
        icon: <DocumentTextIcon {...icon} />,
        name: "SOP Documents",
        path: "/sop_documents",
        element: <SopDocuments />,
      },
      {
        icon: <HomeIcon {...icon} />,
        name: "Property Documents",
        path: "/property_documents",
        element: <PropertyDocuments />,
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
      },
     
    ],
  },
];

export default routes;
