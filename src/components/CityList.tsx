import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { fetchWeather, removeCity } from "../redux/weatherSlice";

import WeatherCard from "./WeatherCard";

const CityList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cities = useSelector((state: RootState) => state.weather.cities);
  const status = useSelector((state: RootState) => state.weather.status);

  useEffect(() => {
    if (status === "idle" && cities.length > 0) {
      cities.forEach((city) => {
        if (!city.weather) {
          dispatch(fetchWeather(city.name));
        }
      });
    }
  }, [dispatch, cities, status]);

  const handleDelete = (cityId: string) => {
    dispatch(removeCity(cityId));
  };

  return (
    <div className="city-list">
      {cities.map((city) => (
        <WeatherCard key={city.id} city={city} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default CityList;
// CityList.test.tsx
// WeatherCard.test.tsx
// WeatherDetail.test.tsx