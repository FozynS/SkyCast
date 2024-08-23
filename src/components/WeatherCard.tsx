import React, { useEffect, useState } from "react";
import { CityWeather } from "../types/CityWeather.type";
import useLocation from "../hooks/useLocation";
import { useNavigate } from "react-router-dom";

interface WeatherCardProps {
  city: CityWeather;
  onDelete: (cityId: string) => void;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ city, onDelete }) => {
  if (!city.weather) {
    return <div>Weather data not available</div>;
  }

  const navigate = useNavigate();
  const { location, error: locationError } = useLocation();
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    if (city.timezone !== undefined) {
      const updateTime = () => {
        const now = new Date();
        const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;

        const localTime = new Date(utcTime + city.timezone! * 1000);
        setCurrentTime(localTime.toLocaleTimeString());
      };

      updateTime();
      const intervalId = setInterval(updateTime, 1000);

      return () => clearInterval(intervalId);
    }
  }, [city.timezone]);

  const iconUrl = city.weather.icon
    ? `https://openweathermap.org/img/wn/${city.weather.icon}@2x.png`
    : "";

  const handleCardClick = () => {
    navigate(`/city/${encodeURIComponent(city.name)}`);
  };

  return (
    <div className="weather-card_container" onClick={handleCardClick}>
      {location ? (
        <>
          <div className="time_container">
            <div className="time_content">
              <h4>{city.name}</h4>
              <h3>{currentTime}</h3>
            </div>
            <div className="btn_container">
              <button onClick={() => onDelete(city.id)}>Delete</button>
            </div>
          </div>
          {city && city.weather ? (
            <>
              <div className="weather-card_info">
                <img src={iconUrl} alt="weather icon" />
                <p>{city.weather?.temperature}°C</p>
                <div>
                  <p className="weather-card_desc">{city.weather.main}</p>
                  <p>Feels Like {city.weather.feels_like}°</p>
                </div>
              </div>
              <p>
                {city.weather.description}. The high temp will be:{" "}
                {city.weather.max_temp}°
              </p>
            </>
          ) : (
            <p>No weather data available</p>
          )}
        </>
      ) : (
        <p>Loading location...</p>
      )}
      {locationError && <p>{locationError}</p>}
    </div>
  );
};

export default WeatherCard;
