import React from "react";
import "./Header.css";
import Logo from "../../assets/images/realitio_header_logo.png";
import DividerImg from "../../assets/images/line_style.png";
import { useChainId } from "../../hooks/useChainId";

const labels: Record<number, string> = {
  1: "Main Ethereum Network",
  4: "Rinkeby Test Network",
  8: "Ubiq Main Network",
  42: "Kovan Test Network",
  56: "Binance Smart Chain",
  77: "Sokal Network",
  100: "XDAI Network",
  137: "Polygon Main Network (Matic)",
  42161: "Arbitrum One Network",
  421611: "Arbitrum Rinkeby Test Network",
  123411710: "Local Test Network",
};

function getNetworkLabel(chainId: number) {
  return labels[chainId] || "Unknown Test Network";
}

export const Header = () => {
  const chainId = useChainId();
  const label = getNetworkLabel(chainId);

  return (
    <div>
      <header className="header-container">
        <div className="header-logo-container">
          <img src={Logo} alt="Logo" className="header-logo" />
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
