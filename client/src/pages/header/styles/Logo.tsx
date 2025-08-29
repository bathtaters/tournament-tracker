import { Link } from "react-router-dom";
import logo from "assets/images/logo2024.png";
import { defaultSettings } from "pages/common/services/fetch.services";

type LogoProps = {
  title?: string;
  to?: string;
};

export default function Logo({ title, to }: LogoProps) {
  return (
    <Link to={to} className="h-full">
      <img
        className="h-full w-auto block"
        src={logo}
        alt={title || defaultSettings.title}
      />
      {/* <img className="h-full w-auto hidden dark:block" src={logoDark} alt={title || defaultSettings.title} /> */}
    </Link>
  );
}
