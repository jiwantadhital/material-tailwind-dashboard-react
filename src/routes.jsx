import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { Home,Users,Profile, Tables, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import { Carousel } from "@/pages/mobile";
import { UserDocuments } from "@/pages/documents";
import { Countries } from "@/pages/basic_settings";
const icon = {
  className: "w-5 h-5 text-inherit",
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
      },
        {
          icon: <UserCircleIcon {...icon} />,
          name: "users",
          path: "/users",
          element: <Users />,
          },
      //     {
      //       icon: <UserCircleIcon {...icon} />,
      //       name: "profile",
      //       path: "/profile",
      //       element: <Profile />,
      //       },
      // {
      //   icon: <TableCellsIcon {...icon} />,
      //   name: "tables",
      //   path: "/tables",
      //   element: <Tables />,
      // },
      // {
      //   icon: <InformationCircleIcon {...icon} />,
      //   name: "notifications",
      //   path: "/notifications",
      //   element: <Notifications />,
      // },
    ],
  },
  // {
  //   title: "Mobile Dashboard",
  //   layout: "mobile",
  //   pages: [
  //     {
  //       icon: <ServerStackIcon {...icon} />,
  //       name: "Carousel",
  //       path: "/carousel",
  //       element: <Carousel />,
  //     },
      
     
  //   ],
  // },
  {
    title: "Basic Settings",
    layout: "basicSettings",
    pages: [
     
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Countries",
        path: "/countries",
        element: <Countries />,
      },
     
    ],
  },
  {
    title: "Documents",
    layout: "documents",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "User Documents",
        path: "/user_documents",
        element: <UserDocuments />,
      },
    ],
  },

  
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;
