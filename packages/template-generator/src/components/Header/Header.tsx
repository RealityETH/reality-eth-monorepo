import React from "react";
import "./Header.css";
import Logo from "../../assets/images/realitio_header_logo.png";
import DividerImg from "../../assets/images/line_style.png";
import { useChainId } from "../../hooks/useChainId";
import { getNetworkLabel } from "../../helpers/network";

export const Header = () => {
  const chainId = useChainId();
  const label = getNetworkLabel(chainId);

  return (
    <div>
      <header className="header-container">
        <div className="header-logo-container">
          <a href="/">
            <img src={Logo} alt="Logo" className="header-logo" />
          </a>
          <span className="network-text">{label}</span>
        </div>
      </header>
      <div
        className="divider"
        style={{ backgroundImage: `url(${DividerImg})` }}
      />
    </div>
  );
};
