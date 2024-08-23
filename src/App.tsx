import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import CityList from "./components/CityList";
import WeatherDetail from "./components/WeatherDetail";

import "./styles/css/style.css";

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<CityList />} />
        <Route path="/city/:cityName" element={<WeatherDetail />} />
      </Routes>
    </Router>
  );
};

export default App;
