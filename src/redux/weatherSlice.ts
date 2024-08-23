import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { CityWeather } from "../types/CityWeather.type";

interface HourlyForecast {
  time: string;
  temperature: number;
}

export interface WeatherState {
  cities: CityWeather[];
  citySuggestions: { name: string; country: string }[];
  hourlyForecast: { [cityId: string]: HourlyForecast[] };
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: WeatherState = {
  cities: JSON.parse(localStorage.getItem("cities") || "[]"),
  citySuggestions: [],
  hourlyForecast: {},
  status: "idle",
  error: null,
};

interface CitySuggestionResponse {
  name: string;
  country: string;
}

interface HourlyForecastResponse {
  cityName: string;
  forecasts: HourlyForecast[];
}

const apiKey = import.meta.env.VITE_APP_WEATHER_API_KEY;

export const fetchCitySuggestions = createAsyncThunk(
  "weather/fetchCitySuggestions",
  async (cityName: string) => {
    const response = await axios.get<CitySuggestionResponse[]>(
      `http://api.openweathermap.org/geo/1.0/direct`,
      {
        params: {
          q: cityName,
          limit: 5,
          appid: apiKey,
        },
      }
    );
    return response.data.map(city => ({
      name: city.name,
      country: city.country,
    }));
  }
);

export const fetchHourlyForecast = createAsyncThunk(
  "weather/fetchHourlyForecast",
  async (cityName: string) => {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          q: cityName,
          appid: apiKey,
          units: "metric",
        },
      }
    );

    const forecasts = response.data.list.map((item: any) => ({
      time: item.dt_txt,
      temperature: item.main.temp,
    }));

    return { cityName, forecasts };
  }
);

export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",
  async (cityName: string) => {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: cityName,
          appid: apiKey,
          units: "metric",
        },
      }
    );
    return {
      id: response.data.id,
      name: cityName,
      weather: {
        icon: response.data.weather[0].icon,
        main: response.data.weather[0].main,
        description: response.data.weather[0].description,
        temperature: response.data.main.temp,
        feels_like: response.data.main.feels_like,
        max_temp: response.data.main.temp_max,
      },
      timezone: response.data.timezone,
    };
  }
);

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    addCity: (state, action: PayloadAction<CityWeather>) => {
      const existingCityIndex = state.cities.findIndex(
        (city) => city.id === action.payload.id
      );
      if (existingCityIndex === -1) {
        state.cities.push(action.payload);
        localStorage.setItem("cities", JSON.stringify(state.cities));
      }
    },
    removeCity: (state, action: PayloadAction<string>) => {
      state.cities = state.cities.filter((city) => city.id !== action.payload);
      localStorage.setItem("cities", JSON.stringify(state.cities));
    },
    updateWeather: (state, action: PayloadAction<CityWeather>) => {
      const index = state.cities.findIndex(
        (city) => city.id === action.payload.id
      );
      if (index !== -1) {
        state.cities[index] = action.payload;
        localStorage.setItem("cities", JSON.stringify(state.cities));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCitySuggestions.fulfilled, (state, action: PayloadAction<{ name: string; country: string }[]>) => {
        state.citySuggestions = action.payload;
      })
      .addCase(fetchCitySuggestions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch city suggestions";
      })
      .addCase(fetchWeather.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWeather.fulfilled, (state, action: PayloadAction<CityWeather>) => {
        state.status = "idle";
        const existingCityIndex = state.cities.findIndex(
          (city) => city.id === action.payload.id
        );
        if (existingCityIndex !== -1) {
          state.cities[existingCityIndex] = action.payload;
        } else {
          state.cities.push(action.payload);
        }
        localStorage.setItem("cities", JSON.stringify(state.cities));
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch weather data";
      })
      .addCase(fetchHourlyForecast.fulfilled, (state, action: PayloadAction<HourlyForecastResponse>) => {
        state.hourlyForecast[action.payload.cityName] = action.payload.forecasts;
      })
      .addCase(fetchHourlyForecast.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch hourly forecast";
      });
  },
});

export const { addCity, removeCity, updateWeather } = weatherSlice.actions;
export default weatherSlice.reducer;
