import { Typography } from "@material-tailwind/react";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="py-6 border-t border-white/10">
      <div className="flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-between">
        <Typography variant="small" className="font-normal text-blue-gray-500">
          &copy; {currentYear}{" "}
          <a
            href="/"
            className="text-blue-500 hover:text-blue-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Notary Sathi
          </a>{" "}
          • All Rights Reserved
        </Typography>
        <ul className="flex items-center gap-4">
          <li>
            <a
              href="#"
              className="block py-1 px-2 text-sm font-normal text-blue-gray-500 transition-colors hover:text-blue-500"
            >
              Terms & Conditions
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block py-1 px-2 text-sm font-normal text-blue-gray-500 transition-colors hover:text-blue-500"
            >
              Privacy Policy
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block py-1 px-2 text-sm font-normal text-blue-gray-500 transition-colors hover:text-blue-500"
            >
              Contact Us
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
