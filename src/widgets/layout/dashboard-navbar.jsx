import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Avatar,
} from "@material-tailwind/react";
import {
  Cog6ToothIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "@/context";

export function DashboardNavbar() {
  const userJSON = localStorage.getItem("user");
  const user = userJSON ? JSON.parse(userJSON) : null;
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-xl border border-white/10 backdrop-blur-lg bg-white/80"
          : "px-0 py-1"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${
              fixedNavbar ? "mt-1" : ""
            }`}
          >
            <Link to={`/${layout}`}>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-medium opacity-60 transition-all hover:text-blue-500 hover:opacity-100"
              >
                {layout}
              </Typography>
            </Link>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-medium"
            >
              {page}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h6" color="blue-gray" className="font-bold">
            {page}
          </Typography>
        </div>
        <div className="flex items-center gap-4">
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>
          
          <IconButton
            variant="text"
            color="blue-gray"
            className="relative bg-white/10 hover:bg-blue-500/10 transition-colors rounded-full h-10 w-10 flex items-center justify-center shadow-md"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-5 w-5 text-blue-gray-500" />
          </IconButton>
          
          <div className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1">
            <Avatar
              variant="circular"
              size="sm"
              alt="User"
              className="border-2 border-white shadow-md"
              src="https://demos.creative-tim.com/material-dashboard/assets/img/team-1.jpg"
            />
            <div>
              <Typography variant="small" color="blue-gray" className="normal-case font-medium">
                {user?.name || 'User'}
              </Typography>
              <Typography variant="small" className="text-xs font-normal text-blue-gray-500 normal-case">
                {user?.role || 'Guest'}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
