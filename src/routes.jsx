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
  UserGroupIcon,
  PhoneIcon,
  StarIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/solid";
import { Home, LawyerDashboard, DashboardWrapper, Users,Profile, Tables, Notifications, Create_admin, DocumentSearch } from "@/pages/dashboard";
import { SignIn, SignUp, ForgotPassword } from "@/pages/auth";
import {  NotaryDocuments, SopDocuments, PropertyDocuments } from "@/pages/documents";
import { Countries, Services } from "@/pages/basic_settings";
import { ReportList } from "@/pages/reports";
import { Carousel, InfoMenu } from "@/pages/mobile";
import { RejectedDocuments } from "@/pages/documents";
import { UserDocuments } from "@/pages/documents";
import { ServiceType } from "@/pages/basic_settings";
import { HeroSection, FeaturesSection, TestimonialsSection } from "@/pages/homepage";
import AboutUsSection from "@/pages/homepage/about-us-section";
import ContactInfo from "@/pages/homepage/contact-info";
import CoreValuesSection from "@/pages/homepage/core-values-section";
import TeamMembersSection from "@/pages/homepage/team-members-section";
import ContactFormSubmissions from "@/pages/homepage/contact-form-submissions";
import { LawyerRevenue } from "@/pages/dashboard";

const icon = {
  className: "w-5 h-5 text-inherit",
};

// Function to handle logout
const handleLogout = () => {
  localStorage.clear();
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
  
  return services.map(service => {
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
  // Main Dashboard Routes
  {
    title: "Dashboard",
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Dashboard",
        path: "/home",
        element: <DashboardWrapper />,
        allowedRoles: ["admin", "lawyer"],
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Users",
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
      {
        icon: <DocumentIcon {...icon} />,
        name: "Document Search",
        path: "/document-search",
        element: <DocumentSearch />,
        allowedRoles: ["admin"]
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Profile",
        path: "/profile",
        element: <Profile />,
        allowedRoles: ["admin", "lawyer"]
      },
    ],
  },

  // Documents Routes
  {
    title: "Documents",
    layout: "documents",
    pages: generateServiceDocumentRoutes(),
  },

  // Basic Settings Routes
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
    ],
  },

  // Homepage Management Routes
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

    ],
  },

  // About Us Management Routes
  {
    title: "About Us Management",
    layout: "basicSettings",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "About Us Section",
        path: "/about-us-section",
        element: <AboutUsSection />,
        allowedRoles: ["admin"]
      },
      {
        icon: <PhoneIcon {...icon} />,
        name: "Contact Info",
        path: "/contact-info",
        element: <ContactInfo />,
        allowedRoles: ["admin"]
      },
      {
        icon: <StarIcon {...icon} />,
        name: "Core Values",
        path: "/core-values",
        element: <CoreValuesSection />,
        allowedRoles: ["admin"]
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "Team Members",
        path: "/team-members",
        element: <TeamMembersSection />,
        allowedRoles: ["admin"]
      },
      {
        icon: <ChatBubbleLeftRightIcon {...icon} />,
        name: "Contact Form Submissions",
        path: "/contact-form-submissions",
        element: <ContactFormSubmissions />,
        allowedRoles: ["admin"]
      },
    ],
  },

  // Mobile Management Routes
  {
    title: "Mobile Management",
    layout: "mobile",
    pages: [
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

  // Reports Routes
  {
    title: "Reports",
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

  // Auth Routes
  {
    title: "Authentication",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Sign In",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Sign Up",
        path: "/sign-up",
        element: <SignUp />,
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Forgot Password",
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Logout",
        path: "/logout",
        element: <SignIn />, // This won't be rendered, just for the route
        onClick: handleLogout,
      },
    ],
  },
];

// Function to get filtered routes based on user role
export const getFilteredRoutes = () => {
  const user = localStorage.getItem('user');
  const userRole = user ? JSON.parse(user).role : null;
  const token = localStorage.getItem('token');

  return routes.map(routeGroup => {
    const filteredPages = routeGroup.pages.filter(page => {
      // Skip pages that are explicitly marked to not show in navigation
      if (page.showInNav === false) return false;
      
      // For auth pages, show different options based on login status
      if (routeGroup.title === "Authentication") {
        if (page.name === "Sign In" && token) {
          return false; // Hide sign in if logged in
        }
        if (page.name === "Sign Up" && token) {
          return false; // Hide sign up if logged in
        }
        if (page.name === "Forgot Password" && token) {
          return false; // Hide forgot password if logged in
        }
        if (page.name === "Logout" && !token) {
          return false; // Hide logout if not logged in
        }
      }
      
      // Continue with existing role-based filtering
      if (!page.allowedRoles) return true;
      return page.allowedRoles.includes(userRole);
    });

    return {
      ...routeGroup,
      pages: filteredPages
    };
  }).filter(routeGroup => {
    // For lawyers, only show relevant route groups
    if (userRole === "lawyer") {
      return routeGroup.pages.length > 0 && (
        routeGroup.title === "Dashboard" || 
        routeGroup.title === "Documents" ||
        routeGroup.title === "Authentication"
      );
    }
    // For admins, show all route groups that have pages
    return routeGroup.pages.length > 0;
  });
};

// For backward compatibility, export the original routes
export const filteredRoutes = getFilteredRoutes();

export default filteredRoutes;
