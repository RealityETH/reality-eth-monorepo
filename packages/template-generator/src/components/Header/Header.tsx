import React from "react";
import "./Header.css";
import Logo from "../../assets/images/realitio_header_logo.png";
import DividerImg from "../../assets/images/line_style.png";

export const Header = () => {
  return (
    <div>
      <header className="header-container">
        <div className="header-logo-container">
          <img src={Logo} alt="Logo" className="header-logo" />
          <span className="network-text">Main Ethereum Network</span>
        </div>
      </header>
      <div
        className="divider"
        style={{ backgroundImage: `url(${DividerImg})` }}
      />
    </div>
  );
};
