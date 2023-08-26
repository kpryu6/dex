import Header from "./components/Header";
import Swap from "./components/Swap";

import { Route, Routes } from "react-router-dom"; // ������ �κ�
import "./App.css";

function App() {
  return (
    <div className="App">
      <Header />
      <div className="main">
        <Routes>
          <Route path="/swap" element={<Swap />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
