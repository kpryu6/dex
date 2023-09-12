import { React, useState } from "react";
import inch from "../img/inch.svg";
import eth from "../img/eth.svg";
import { DownOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

function Header(props) {
  const { address, isConnected, connect } = props;
  const [listVisible, setListVisible] = useState(false);

  function changeChain() {
    setListVisible(!listVisible);
  }

  return (
    <header>
      <div className="left">
        <Link to="/" className="link">
          <img src={inch} alt="logo" className="logo" />
        </Link>
        <Link to="/swap" className="link">
          <div className="headerItem">Swap</div>
        </Link>
      </div>

      <div className="right">
        <div className="headerItem" onClick={changeChain}>
          <div className="selectChain">
            <img src={eth} alt="eth" className="eth" />
            Ethereum
            <DownOutlined />
          </div>
          {listVisible && (
            <ul className="chainList">
              <li>Binance Chain</li>
              <li>Polygon</li>
              <li>Arbitrum</li>
            </ul>
          )}
        </div>

        <div className="connectButton" onClick={connect}>
          {isConnected
            ? address.slice(0, 4) + "..." + address.slice(38)
            : "ConnectWallet"}
        </div>
      </div>
    </header>
  );
}

export default Header;
