import { useState, useEffect } from "react";

interface Location {
  country: string;
  city: string;
}

interface GeocodeResponse {
  results: {
    address_components: {
      long_name: string;
      types: string[];
    }[];
  }[];
  status: string;
}

interface UseLocationResult {
  location: Location | null;
  error: string | null;
}

const LOCAL_STORAGE_KEY = "user_location";

const useLocation = (): UseLocationResult => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const storedLocation = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (storedLocation) {
        setLocation(JSON.parse(storedLocation));
        return;
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const apiKey = import.meta.env.VITE_APP_GOOGLE_API_KEY;
              if (!apiKey) throw new Error("API key is missing");

              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
              );
              const data: GeocodeResponse = await response.json();

              if (data.status === "OK") {
                const addressComponents = data.results[0].address_components;
                const country =
                  addressComponents.find((comp) =>
                    comp.types.includes("country")
                  )?.long_name || "Unknown";
                const city =
                  addressComponents.find((comp) =>
                    comp.types.includes("locality")
                  )?.long_name || "Unknown";

                const locationData = { country, city };
                setLocation(locationData);

                localStorage.setItem(
                  LOCAL_STORAGE_KEY,
                  JSON.stringify(locationData)
                );
              } else {
                setError("Unable to retrieve your location details");
              }
            } catch (error) {
              console.error(error);
              setError("Failed to fetch location data");
            }
          },
          (error) => {
            setError("Unable to retrieve your location");
          }
        );
      } else {
        setError("Geolocation is not supported by your browser");
      }
    };

    fetchLocation();
  }, []);

  return { location, error };
};

export default useLocation;
