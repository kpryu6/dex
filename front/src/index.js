import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
// BrowserRouter
import { BrowserRouter } from "react-router-dom";
// mainnet: mainnet ¼³Á¤
import { configureChains, mainnet, WagmiConfig, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { avalanche, bsc } from "@wagmi/chains";

// createConfig for wallet connection
const { provider, webSocketProvider, chains } = configureChains(
  [mainnet, avalanche, bsc],
  [publicProvider()]
);

// web3 client
const client = createConfig({
  autoConnect: true,
  provider,
  webSocketProvider,
  chains,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <WagmiConfig config={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WagmiConfig>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
