import React from "react";
import logo from "../logo.svg";

import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <div className="left">
        <Link to="/" className="link">
          <img src={logo} alt="logo" className="logo" />
        </Link>
        <Link to="/swap" className="link">
          <div className="headerItem">Swap</div>
        </Link>
        <Link to="/tokens" className="link">
          <div className="headerItem">Tokens</div>
        </Link>
      </div>

      <div className="right">
        <div className="headerItem">
          <img src={logo} alt="eth" className="eth" />
          Ethereum
        </div>
        <div className="coonectButton">ConnectWallet</div>
      </div>
    </header>
  );
}

export default Header;
