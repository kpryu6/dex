import Header from "./components/Header";
import Swap from "./components/Swap";
import Tokens from "./components/Tokens";
import { Route, Routes } from "react-router-dom"; // 수정된 부분
import "./App.css";

function App() {
  return (
    <div className="App">
      <Header />
      <div className="main">
        <Routes>
          <Route path="/swap" element={<Swap />} />
          <Route path="/tokens" element={<Tokens />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
