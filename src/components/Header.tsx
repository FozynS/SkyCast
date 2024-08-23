import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";

import locationSVG from "../assets/images/location.svg";

import useLocation from "../hooks/useLocation";
import {
  addCity,
  fetchCitySuggestions,
  fetchWeather,
} from "../redux/weatherSlice";
import { AppDispatch, RootState } from "../redux/store";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestionsVisible, setSuggestionsVisible] = useState<boolean>(false);
  const { location, error } = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const citySuggestions = useSelector(
    (state: RootState) => state.weather.citySuggestions
  );
  const cities = useSelector((state: RootState) => state.weather.cities);
  const navigate = useNavigate();

  const debouncedFetchSuggestions = useCallback(
    debounce((query: string) => {
      dispatch(fetchCitySuggestions(query));
    }, 300),
    [dispatch]
  );

  useEffect(() => {
    if (searchQuery) {
      debouncedFetchSuggestions(searchQuery);
      setSuggestionsVisible(true);
    } else {
      setSuggestionsVisible(false);
    }
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [searchQuery, debouncedFetchSuggestions]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleCitySelect = (city: { name: string; country: string }) => {
    const cityName = `${city.name}, ${city.country}`;
    dispatch(fetchWeather(cityName)).then((action) => {
      if (fetchWeather.fulfilled.match(action)) {
        const existingCity = cities.find(
          (existingCity) => existingCity.id === action.payload.id
        );
        if (!existingCity) {
          dispatch(addCity(action.payload));
        }
      }
    });
    setSuggestionsVisible(false);
    setSearchQuery("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (searchQuery) {
        debouncedFetchSuggestions(searchQuery);
      }
    }
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <header>
      <h1 className="logo" onClick={handleLogoClick}>
        SkyCast
      </h1>
      <div className="location_container">
        <img src={locationSVG} alt="Location Icon" />
        <p className="location-text">
          {location
            ? `${location.city}, ${location.country}`
            : error || "Loading location..."}
        </p>
      </div>
      <div className="search_container">
        <input
          className="search_input"
          type="text"
          placeholder="Search city..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {suggestionsVisible && citySuggestions.length > 0 && (
          <ul className="suggestions_list">
            {citySuggestions.map((city, index) => (
              <li key={index} onClick={() => handleCitySelect(city)}>
                {city.name}, {city.country}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
};

export default Header;
