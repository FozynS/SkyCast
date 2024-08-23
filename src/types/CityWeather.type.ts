export interface CityWeather {
  id: string;
  name: string;
  weather?: {
    icon: string;
    main: string;
    description: string;
    temperature: number;
    feels_like: number;
    max_temp: number;
  } | null;
  timezone?: number;
}
