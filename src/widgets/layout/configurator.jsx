import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Button,
  IconButton,
  Switch,
  Typography,
  Chip,
} from "@material-tailwind/react";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setSidenavColor,
  setSidenavType,
  setFixedNavbar,
} from "@/context";

function formatNumber(number, decPlaces) {
  decPlaces = Math.pow(10, decPlaces);

  const abbrev = ["K", "M", "B", "T"];

  for (let i = abbrev.length - 1; i >= 0; i--) {
    var size = Math.pow(10, (i + 1) * 3);

    if (size <= number) {
      number = Math.round((number * decPlaces) / size) / decPlaces;

      if (number == 1000 && i < abbrev.length - 1) {
        number = 1;
        i++;
      }

      number += abbrev[i];

      break;
    }
  }

  return number;
}

export function Configurator() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openConfigurator, sidenavColor, sidenavType, fixedNavbar } =
    controller;
  const [stars, setStars] = React.useState(0);

  const sidenavColors = {
    blue: "from-blue-400 to-blue-600",
    "blue-gray": "from-blue-gray-800 to-blue-gray-900",
    green: "from-green-400 to-green-600",
    orange: "from-orange-400 to-orange-600",
    red: "from-red-400 to-red-600",
    purple: "from-purple-400 to-purple-600",
    pink: "from-pink-400 to-pink-600",
    indigo: "from-indigo-400 to-indigo-600",
  };

  React.useEffect(() => {
    const stars = fetch(
      "https://api.github.com/repos/creativetimofficial/material-tailwind-dashboard-react"
    )
      .then((response) => response.json())
      .then((data) => setStars(formatNumber(data.stargazers_count, 1)));
  }, []);

  return (
    <aside
      className={`fixed top-0 right-0 z-50 h-screen w-96 bg-gradient-to-b from-[#0B1121] to-[#0F172A] px-2.5 shadow-2xl transition-transform duration-300 ${
        openConfigurator ? "translate-x-0" : "translate-x-96"
      }`}
    >
      <div className="flex items-start justify-between px-6 pt-8 pb-6 border-b border-white/10">
        <div>
          <Typography variant="h5" color="white">
            Dashboard Settings
          </Typography>
          <Typography className="font-normal text-white/60">
            Customize your dashboard experience
          </Typography>
        </div>
        <IconButton
          variant="text"
          color="white"
          onClick={() => setOpenConfigurator(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
        </IconButton>
      </div>
      <div className="py-6 px-6 overflow-y-auto h-[calc(100vh-100px)] custom-scrollbar">
        <div className="mb-12">
          <Typography variant="h6" color="white" className="mb-4">
            Sidenav Colors
          </Typography>
          <div className="mt-3 flex items-center gap-2">
            {Object.keys(sidenavColors).map((color) => (
              <span
                key={color}
                className={`h-8 w-8 cursor-pointer rounded-full bg-gradient-to-r ${
                  sidenavColors[color]
                } transition-transform hover:scale-105 ${
                  sidenavColor === color ? "ring-2 ring-white" : ""
                }`}
                onClick={() => setSidenavColor(dispatch, color)}
              />
            ))}
          </div>
        </div>
        <div className="mb-12">
          <Typography variant="h6" color="white" className="mb-4">
            Sidenav Type
          </Typography>
          <Typography variant="small" color="white" className="font-normal opacity-60 mb-4">
            Choose how your sidenav will look like.
          </Typography>
          <div className="mt-3 flex flex-col gap-3">
            <Button
              variant={sidenavType === "dark" ? "gradient" : "outlined"}
              color={sidenavType === "dark" ? "blue" : "white"}
              onClick={() => setSidenavType(dispatch, "dark")}
              className={sidenavType === "dark" ? "border-none" : "border-white/20 text-white"}
            >
              Dark
            </Button>
            <Button
              variant={sidenavType === "transparent" ? "gradient" : "outlined"}
              color={sidenavType === "transparent" ? "blue" : "white"}
              onClick={() => setSidenavType(dispatch, "transparent")}
              className={sidenavType === "transparent" ? "border-none" : "border-white/20 text-white"}
            >
              Transparent
            </Button>
            <Button
              variant={sidenavType === "white" ? "gradient" : "outlined"}
              color={sidenavType === "white" ? "blue" : "white"}
              onClick={() => setSidenavType(dispatch, "white")}
              className={sidenavType === "white" ? "border-none" : "border-white/20 text-white"}
            >
              White
            </Button>
          </div>
        </div>
        <div className="mb-12">
          <div className="flex items-center justify-between py-5 px-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10">
            <Typography variant="h6" color="white">
              Fixed Navbar
            </Typography>
            <Switch
              id="navbar-fixed"
              value={fixedNavbar}
              onChange={() => setFixedNavbar(dispatch, !fixedNavbar)}
              color="blue"
              className="checked:bg-blue-500"
            />
          </div>
        </div>
        
        <div className="my-8 flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10">
            <Typography variant="small" color="white" className="font-medium mb-3">
              Need help with customization?
            </Typography>
            <Typography variant="small" color="white" className="opacity-60 mb-4">
              Check our documentation for detailed instructions.
            </Typography>
            <Button 
              variant="gradient" 
              color="blue" 
              fullWidth
              className="mt-2"
            >
              View Documentation
            </Button>
          </div>
        </div>
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

Configurator.displayName = "/src/widgets/layout/configurator.jsx";

export default Configurator;
