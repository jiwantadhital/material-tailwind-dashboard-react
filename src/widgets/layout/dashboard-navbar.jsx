import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "@/context";

export function DashboardNavbar() {
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
          <div className="relative mr-auto md:mr-4 md:w-56">
            <Input 
              label="Search" 
              icon={<MagnifyingGlassIcon className="h-4 w-4 text-blue-gray-400" />}
              className="!border-blue-gray-200 focus:!border-blue-500 rounded-lg bg-white/80 backdrop-blur-sm"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>
         
          <Menu>
            <MenuHandler>
              <div className="relative">
                <IconButton 
                  variant="text" 
                  color="blue-gray"
                  className="relative bg-white/10 hover:bg-blue-500/10 transition-colors rounded-full h-10 w-10 flex items-center justify-center shadow-md"
                >
                  <BellIcon className="h-5 w-5 text-blue-gray-500" />
                </IconButton>
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold border border-white">
                  3
                </span>
              </div>
            </MenuHandler>
            <MenuList className="w-max border-0 overflow-hidden shadow-xl bg-white rounded-lg p-0">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 py-2 px-4">
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Notifications
                </Typography>
              </div>
              <MenuItem className="flex items-center gap-3 py-3 px-4 hover:bg-blue-gray-50/80">
                <Avatar
                  src="https://demos.creative-tim.com/material-dashboard/assets/img/team-2.jpg"
                  alt="item-1"
                  size="sm"
                  variant="circular"
                  className="border border-blue-500/20"
                />
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    <strong>New message</strong> from Laur
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> 13 minutes ago
                  </Typography>
                </div>
              </MenuItem>
              <MenuItem className="flex items-center gap-4 py-3 px-4 hover:bg-blue-gray-50/80">
                <Avatar
                  src="https://demos.creative-tim.com/material-dashboard/assets/img/small-logos/logo-spotify.svg"
                  alt="item-1"
                  size="sm"
                  variant="circular"
                  className="border border-blue-500/20"
                />
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    <strong>New album</strong> by Travis Scott
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> 1 day ago
                  </Typography>
                </div>
              </MenuItem>
              <MenuItem className="flex items-center gap-4 py-3 px-4 hover:bg-blue-gray-50/80">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                  <CreditCardIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    Payment successfully completed
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> 2 days ago
                  </Typography>
                </div>
              </MenuItem>
              <div className="border-t border-blue-gray-50">
                <Link 
                  to="/notifications" 
                  className="flex items-center justify-center w-full py-3 text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  See All Notifications
                </Link>
              </div>
            </MenuList>
          </Menu>
          
          <IconButton
            variant="text"
            color="blue-gray"
            className="relative bg-white/10 hover:bg-blue-500/10 transition-colors rounded-full h-10 w-10 flex items-center justify-center shadow-md"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-5 w-5 text-blue-gray-500" />
          </IconButton>
          
          <Menu>
            <MenuHandler>
              <Button 
                variant="text"
                color="blue-gray"
                className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1"
              >
                <Avatar
                  variant="circular"
                  size="sm"
                  alt="User"
                  className="border-2 border-white shadow-md"
                  src="https://demos.creative-tim.com/material-dashboard/assets/img/team-1.jpg"
                />
                <div>
                  <Typography variant="small" className="normal-case font-medium">
                    John Doe
                  </Typography>
                  <Typography variant="small" className="text-xs font-normal text-blue-gray-500 normal-case">
                    Administrator
                  </Typography>
                </div>
              </Button>
            </MenuHandler>
            <MenuList className="p-1 min-w-[180px]">
              <MenuItem className="flex items-center gap-2 rounded-lg hover:bg-blue-gray-50/80">
                <UserCircleIcon className="h-4 w-4 text-blue-gray-500" />
                <Typography variant="small" className="font-medium">My Profile</Typography>
              </MenuItem>
              <MenuItem className="flex items-center gap-2 rounded-lg hover:bg-blue-gray-50/80">
                <Cog6ToothIcon className="h-4 w-4 text-blue-gray-500" />
                <Typography variant="small" className="font-medium">Settings</Typography>
              </MenuItem>
              <hr className="my-2 border-blue-gray-50" />
              <MenuItem className="flex items-center gap-2 rounded-lg text-red-500 hover:bg-red-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
                  />
                </svg>
                <Typography variant="small" className="font-medium">Sign Out</Typography>
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
