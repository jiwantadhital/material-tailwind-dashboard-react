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
import { SignIn, SignUp, ForgotPassword } from "@/pages/auth";
import {  NotaryDocuments, SopDocuments, PropertyDocuments } from "@/pages/documents";
import { Countries, Services } from "@/pages/basic_settings";
import { ReportList } from "@/pages/reports";
import { Carousel, InfoMenu } from "@/pages/mobile";
import { RejectedDocuments } from "@/pages/documents";
import { UserDocuments } from "@/pages/documents";
import { ServiceType } from "@/pages/basic_settings";
import { HeroSection, FeaturesSection, TestimonialsSection, CallToActionSection } from "@/pages/homepage";
import { LawyerRevenue } from "@/pages/dashboard";
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

// Get services from localStorage
const getServicesFromLocalStorage = () => {
  try {
    const servicesData = localStorage.getItem('services');
    if (servicesData) {
      const parsedServices = JSON.parse(servicesData);
      return parsedServices.data || [];
    }
    return [];
  } catch (error) {
    console.error('Error parsing services from localStorage:', error);
    return [];
  }
};

// Generate dynamic service document routes
const generateServiceDocumentRoutes = () => {
  const services = getServicesFromLocalStorage();
  if (!Array.isArray(services) || services.length === 0) {
    return [];
  }
  
  // Generate a route for each service with a wrapper component to force remounting
  return services.map(service => {
    // Create a wrapper component with the service ID in closure to ensure remounting
    const ServiceDocumentWrapper = () => <UserDocuments code={service.code} serviceId={service.id} />;
    
    return {
      icon: <DocumentIcon {...icon} />,
      name: `${service.name} Documents`,
      path: `/service_documents/${service.id}`,
      element: <ServiceDocumentWrapper />,
      allowedRoles: ["admin","lawyer"]
    };
  });
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
        name: "Create Lawyer",
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
      {
        icon: <BriefcaseIcon {...icon} />,
        name: "Service Type",
        path: "/service_type",
        element: <ServiceType />,
        allowedRoles: ["admin"]
      },
      //Mobile Management
    {
      icon: <UserCircleIcon {...icon} />,
      name: "Carousel",
      path: "/mobile/carousel",
      element: <Carousel />,
      allowedRoles: ["admin"]
    },
    {
      icon: <BriefcaseIcon {...icon} />,
      name: "Info Menu",
      path: "/mobile/info-menu",
      element: <InfoMenu />,
      allowedRoles: ["admin"]
    },
    ],
  },
  {
    title: "Homepage Management",
    layout: "basicSettings",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Hero Section",
        path: "/hero-section",
        element: <HeroSection />,
        allowedRoles: ["admin"]
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Features Section",
        path: "/features-section",
        element: <FeaturesSection />,
        allowedRoles: ["admin"]
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Testimonials",
        path: "/testimonials-section",
        element: <TestimonialsSection />,
        allowedRoles: ["admin"]
      },
      {
        icon: <DocumentTextIcon {...icon} />,
        name: "Call to Action",
        path: "/call-to-action-section",
        element: <CallToActionSection />,
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
    pages: generateServiceDocumentRoutes(),
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
      
      token == null ? {
        icon: <ServerStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      } : null,
      
      {
        icon: <ServerStackIcon {...icon} />,
        name: "forgot password",
        path: "/forgot-password",
        element: <ForgotPassword />,
      },

    ].filter(Boolean),
  },
];

const user = JSON.parse(localStorage.getItem('user')) || { role: null };
const userRole = user.role;

export const filteredRoutes = routes.map(routeGroup => {
  const filteredPages = routeGroup.pages.filter(page => {
    // Skip pages that are explicitly marked to not show in navigation
    if (page.showInNav === false) return false;
    // Continue with existing role-based filtering
    if (!page.allowedRoles) return true;
    return page.allowedRoles.includes(userRole);
  });

  return {
    ...routeGroup,
    pages: filteredPages
  };
}).filter(routeGroup => routeGroup.pages.length > 0);

export default filteredRoutes;
