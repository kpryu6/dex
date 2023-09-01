import Header from "./components/Header";
import Swap from "./components/Swap";
import Home from "./components/Home";

import { Route, Routes } from "react-router-dom"; // 수정된 부분
import "./App.css";
import { useConnect, useAccount } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new MetaMaskConnector(),
  });
  return (
    <div className="App">
      <Header connect={connect} isConnected={isConnected} address={address} />
      <div className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/swap"
            /* 연결되었는지와 주소를 알기 위해 전달 */
            element={<Swap isConnected={isConnected} address={address} />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
