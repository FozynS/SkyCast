import React, { useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { fetchWeather, fetchHourlyForecast } from "../redux/weatherSlice";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const WeatherDetail: React.FC = () => {
  const { cityName } = useParams<{ cityName: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const cityWeather = useSelector((state: RootState) =>
    state.weather.cities.find(
      (city) => city.name.toLowerCase() === cityName?.toLowerCase()
    )
  );
  const hourlyForecast = useSelector(
    (state: RootState) => state.weather.hourlyForecast[cityName!]
  );

  useEffect(() => {
    if (cityName) {
      dispatch(fetchWeather(cityName));
      dispatch(fetchHourlyForecast(cityName));
    }
  }, [dispatch, cityName]);

  const handleUpdate = useCallback(() => {
    if (cityName) {
      dispatch(fetchWeather(cityName));
      dispatch(fetchHourlyForecast(cityName));
    }
  }, [dispatch, cityName]);

  const chartData = useMemo(() => {
    if (!hourlyForecast) return { labels: [], datasets: [] };

    return {
      labels: hourlyForecast.map((forecast) => forecast.time),
      datasets: [
        {
          label: "Temperature (°C)",
          data: hourlyForecast.map((forecast) => forecast.temperature),
          fill: false,
          borderColor: "rgba(75, 192, 192, 1)",
          tension: 0.1,
        },
      ],
    };
  }, [hourlyForecast]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          position: "top" as const,
        },
        title: {
          display: true,
          text: `Hourly Forecast for ${cityWeather?.name}`,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          title: {
            display: true,
            text: "Temperature (°C)",
          },
          beginAtZero: false,
        },
      },
    }),
    [cityWeather]
  );

  if (!cityWeather) return <div>Loading...</div>;
  if (!hourlyForecast) return <div>Fetching hourly forecast...</div>;

  return (
    <div className="weather-detail_container">
      <div className="weather-detail-info-container">
        <div>
          <h1>{cityWeather.name}</h1>
          <p>{cityWeather.weather?.description}</p>
          <p>{cityWeather.weather?.temperature} °C</p>
        </div>
        <div className="btn_container_update">
          <button onClick={handleUpdate}>Update</button>
        </div>
      </div>
      <div className="chart-container">
        <h2>Hourly Temperature Forecast</h2>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default WeatherDetail;
