import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Navbar as MTNavbar,
  Collapse,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function Navbar({ brandName, routes, action }) {
  const [openNav, setOpenNav] = React.useState(false);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {routes.map(({ name, path, icon }) => (
        <Typography
          key={name}
          as="li"
          variant="small"
          color="blue-gray"
          className="capitalize"
        >
          <Link to={path} className="flex items-center gap-1 p-1 font-medium text-gray-300 hover:text-white transition-colors hover:scale-105 transform duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-500 after:transition-all">
            {icon &&
              React.createElement(icon, {
                className: "w-[18px] h-[18px] opacity-50 mr-1",
              })}
            {name}
          </Link>
        </Typography>
      ))}
    </ul>
  );

  return (
    <MTNavbar className="p-3 backdrop-blur-md bg-[#0B1121]/80 border-b border-white/5">
      <div className="container mx-auto flex items-center justify-between text-white">
        <Link to="/" className="flex items-center space-x-3">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
            <svg className="relative w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 19h20L12 2zm0 3l7 14H5l7-14z"/>
            </svg>
          </div>
          <Typography
            variant="h5"
            className="cursor-pointer py-1.5 font-bold"
          >
            {brandName}
          </Typography>
        </Link>
        <div className="hidden lg:block">{navList}</div>
        {React.cloneElement(action, {
          className: "hidden lg:inline-block",
        })}
        <IconButton
          variant="text"
          size="sm"
          color="white"
          className="ml-auto text-inherit hover:bg-white/10 focus:bg-white/10 active:bg-white/10 lg:hidden"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon strokeWidth={2} className="h-6 w-6" />
          ) : (
            <Bars3Icon strokeWidth={2} className="h-6 w-6" />
          )}
        </IconButton>
      </div>
      <Collapse open={openNav}>
        <div className="container mx-auto">
          {navList}
          {React.cloneElement(action, {
            className: "w-full block lg:hidden",
          })}
        </div>
      </Collapse>
    </MTNavbar>
  );
}

Navbar.defaultProps = {
  brandName: "Notary Sathi",
  action: (
    <Button 
      variant="gradient"
      size="sm"
      className="relative group overflow-hidden rounded-lg text-white font-medium"
    >
      <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-0 -translate-y-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:translate-x-0 group-hover:translate-y-0"></span>
      <span className="absolute inset-0 w-full h-full border border-white/20 rounded-lg"></span>
      <span className="relative flex items-center justify-center">
        Get Started
      </span>
    </Button>
  ),
};

Navbar.propTypes = {
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  action: PropTypes.node,
};

Navbar.displayName = "/src/widgets/layout/navbar.jsx";

export default Navbar;
