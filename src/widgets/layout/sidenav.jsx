import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-[#0B1121] to-[#0F172A]",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-white/10 shadow-xl backdrop-blur-sm`}
    >
      <div
        className={`relative border-b border-white/10 py-4`}
      >
        <Link to="/" className="flex items-center justify-center gap-3">
          <img src="/img/nlogo.png" alt="Logo" className="h-10 w-10 object-contain" />
          <Typography
            variant="h5"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
            className="font-bold"
          >
            {brandName}
          </Typography>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>
      <div className="m-4 overflow-auto h-[calc(100vh-160px)] custom-scrollbar">
        {routes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-6 flex flex-col gap-2">
            {title && (
              <li className="mx-3.5 mt-6 mb-3">
                <Typography
                  variant="small"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="font-bold uppercase tracking-wider opacity-75"
                >
                  {title}
                </Typography>
              </li>
            )}
            {pages.map(({ icon, name, path, onClick }) => (
              <li key={name}>
                {onClick ? (
                  <Button
                    variant="text"
                    color={sidenavType === "dark" ? "white" : "blue-gray"}
                    className="flex items-center gap-4 px-4 py-3 capitalize rounded-lg hover:bg-white/5 transition-colors"
                    fullWidth
                    onClick={onClick}
                  >
                    <div className="rounded-md">
                      {icon}
                    </div>
                    <Typography
                      color="inherit"
                      className="font-medium capitalize"
                    >
                      {name}
                    </Typography>
                  </Button>
                ) : (
                  <NavLink to={`/${layout}${path}`}>
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "gradient" : "text"}
                        color={
                          isActive
                            ? sidenavColor
                            : sidenavType === "dark"
                            ? "white"
                            : "blue-gray"
                        }
                        className={`flex items-center gap-4 px-4 py-3 capitalize rounded-lg ${
                          isActive 
                            ? "shadow-md" 
                            : "hover:bg-white/5 transition-colors"
                        }`}
                        fullWidth
                      >
                        <div className={`rounded-md ${isActive ? "bg-white/20 p-1" : ""}`}>
                          {icon}
                        </div>
                        <Typography
                          color="inherit"
                          className="font-medium capitalize"
                        >
                          {name}
                        </Typography>
                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-current"></div>
                        )}
                      </Button>
                    )}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        ))}
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/nlogo.png",
  brandName: "Notary Sathi",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
