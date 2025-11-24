import { Link } from "react-router-dom";
import litPrimaryOrangeIcon from "./assets/lit-primary-orange.svg";
import { useOptionalLitAuth } from "./lit-login-modal/LitAuthProvider";
import { AppHeader } from "@layout";

export const Header = () => {
  const litAuth = useOptionalLitAuth();
  return (
    <AppHeader
      leftSlot={
        <Link to="/">
          <img
            className="nav-logo w-auto h-7 relative object-contain"
            alt="Lit logo"
            src={litPrimaryOrangeIcon}
          />
        </Link>
      }
      centerSlot={<div className="flex-1 max-w-2xl mx-8"></div>}
      rightSlot={
        litAuth?.isAuthenticated ? (
          <button
            className="cursor-pointer"
            onClick={litAuth.logout}
            aria-label="Logout"
          >
            Logout
          </button>
        ) : null
      }
    />
  );
};
