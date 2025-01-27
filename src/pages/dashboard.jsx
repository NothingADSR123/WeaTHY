import {
  Wind,
  Snowflake,
  CloudFog,
  CloudLightning,
  Droplets,
  Sun,
  Settings,
  Map,
  LayoutGrid,
  CloudRain,
} from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState("Bengaluru"); // Default city
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch weather data
  const fetchWeatherData = async (query) => {
    setLoading(true);
    setError(null);

    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    if (!apiKey) {
      setError(new Error("API Key is not defined."));
      console.error("API Key is missing!");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=5&aqi=no`
      );
      setWeatherData(response.data);
    } catch (err) {
      setError(err);
      console.error("Error fetching weather data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch default city weather on mount
  useEffect(() => {
    fetchWeatherData(city);
  }, []);

  // Handle search for a city
  const handleSearch = () => {
    if (!city.trim()) {
      console.warn("Search input is empty. Skipping fetch.");
      return;
    }
    fetchWeatherData(city);
  };

  // Handle "Enter" key press in the input field
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Destructure data
  const { location, current, forecast } = weatherData || {};

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#121212]">
      <div className="grid h-[90vh] w-[95vw] grid-cols-[60px_1fr_300px] gap-4 rounded-lg shadow-lg overflow-hidden text-[#E0E0E0]">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="p-6 bg-[#333333] overflow-y-auto custom-scrollbar rounded-2xl flex flex-col justify-between">
          <SearchBar
            city={city}
            setCity={setCity}
            handleSearch={handleSearch}
            handleKeyPress={handleKeyPress}
          />

          {loading ? (
            <Loading />
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center h-full">
              <h1 className="text-5xl font-bold text-[#FF4081]">
                Not Available
              </h1>

              <p className="text-[#B0B0B0] text-md">
                Please check the city name and try again.
              </p>
            </div>
          ) : (
            weatherData && (
              <>
                <LocationInfo location={location} current={current} />
                <ForecastSection forecast={forecast} />
              </>
            )
          )}
        </div>

        {/* Right Sidebar */}
        <AirConditions current={current} forecast={forecast} />
      </div>
    </div>
  );
}

// Sidebar Component
function Sidebar() {
  const menuItems = ["Weather", "Cities", "Map", "Settings"];
  const icons = [<CloudRain />, <LayoutGrid />, <Map />, <Settings />];

  return (
    <div className="bg-[#1E1E1E] p-4 flex flex-col gap-8 overflow-y-auto custom-scrollbar rounded-2xl">
      <nav className="flex flex-col gap-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="flex flex-col items-center gap-1 py-4 text-[#B0B0B0] hover:text-[#FF4081]"
          >
            {icons[index]}
            <span className="text-xs">{item}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function SearchBar({ city, setCity, handleSearch, handleKeyPress }) {
  const [suggestedCities, setSuggestedCities] = useState([]);

  // Fetch city suggestions
  const fetchCitySuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestedCities([]);
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const response = await axios.get(
        `http://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${query}`
      );
      setSuggestedCities(response.data);
    } catch (err) {
      console.error("Error fetching city suggestions:", err);
      setSuggestedCities([]);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const query = e.target.value;
    setCity(query);
    fetchCitySuggestions(query);
  };

  // Handle city selection
  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity);
    setSuggestedCities([]);
    handleSearch();
  };

  return (
    <div className="flex justify-center relative w-full mb-2">
      <div className="flex flex-col items-center w-full max-w-xl">
        {/* Input and Button */}
        <div className="flex items-center gap-4 justify-center w-full">
          <input
            type="text"
            value={city}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Search for cities"
            className="w-full px-6 py-2 border border-[#444444] rounded-2xl bg-[#1E1E1E] text-[#E0E0E0] focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-[#FF4081] text-white rounded-2xl cursor-pointer hover:bg-[#e0356f]"
          >
            Search
          </button>
        </div>

        {/* Suggested Cities Dropdown */}
        {suggestedCities.length > 0 && (
          <ul className="absolute top-[60px] w-full max-w-xl bg-[#1E1E1E] border border-[#444444] rounded-2xl shadow-lg text-[#E0E0E0] z-10">
            {suggestedCities.map((city) => (
              <li
                key={city.id}
                onClick={() => handleCitySelect(city.name)}
                className="px-4 py-2 cursor-pointer hover:bg-[#333333] transition-colors"
              >
                {city.name}, {city.region}, {city.country}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
// Loading Component
function Loading() {
  return (
    <div className="w-full flex justify-center items-center py-8">
      <div className="loader"></div>
    </div>
  );
}

// Location and Current Weather Info Component
function LocationInfo({ location, current }) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex justify-around items-start gap-8">
        <div>
          <h1 className="text-5xl font-bold text-[#FF4081]">{location.name}</h1>
          <p className="text-[#B0B0B0] text-lg mt-1">
            Region: {location.region}
          </p>
          <p className="text-[#B0B0B0] text-lg">Country: {location.country}</p>
        </div>
        <div className="flex justify-center">
          {(current.condition.text.toLowerCase().includes("sun") ||
            current.condition.text.toLowerCase().includes("clear")) && (
            <Sun className="w-32 h-32 text-[#FF4081]" />
          )}
          {(current.condition.text.toLowerCase().includes("cloud") ||
            current.condition.text.toLowerCase().includes("cast")) && (
            <CloudRain className="w-32 h-32 text-[#B0B0B0]" />
          )}
          {current.condition.text.toLowerCase().includes("rain") && (
            <Droplets className="w-32 h-32 text-[#00BFFF]" />
          )}
          {current.condition.text.toLowerCase().includes("wind") && (
            <Wind className="w-32 h-32 text-[#00FF7F]" />
          )}
          {current.condition.text.toLowerCase().includes("snow") && (
            <Snowflake className="w-32 h-32 text-[#FFFFFF]" /> // Snowy
          )}
          {(current.condition.text.toLowerCase().includes("fog") ||
            current.condition.text.toLowerCase().includes("mist")) && (
            <CloudFog className="w-32 h-32 text-[#B0B0B0]" /> // Foggy
          )}
          {current.condition.text.toLowerCase().includes("thunder") && (
            <CloudLightning className="w-32 h-32 text-[#FFFF00]" /> // Thunderstorms
          )}
        </div>

        <div className="text-center">
          <div className="text-6xl font-bold text-[#FF4081]">
            {current.temp_c}°C
          </div>
          <p className="text-[#B0B0B0] text-xl mt-2">
            {current.condition.text}
          </p>
        </div>
      </div>
    </div>
  );
}
// Forecast Section Component
function ForecastSection({ forecast }) {
  return (
    <div className="mb-8 border border-[#444444] rounded p-4">
      <h2 className="text-2xl font-medium mb-4">5-Day Forecast</h2>
      <div className="flex justify-around items-center gap-4">
        {forecast.forecastday.map((day, index) => (
          <div
            key={day.date}
            className={`flex flex-col items-center gap-2 px-4 ${
              index !== forecast.forecastday.length - 1 ? " border-[#444]" : ""
            }`}
          >
            <h3 className="text-md font-semibold mb-2">{day.date}</h3>
            <div className="text-sm text-center">
              <p className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-[#FF4081]" />
                <span>
                  Max: <span className="font-bold">{day.day.maxtemp_c}°C</span>
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-[#B0B0B0]" />
                <span>
                  Min: <span className="font-bold">{day.day.mintemp_c}°C</span>
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Air Conditions Component
function AirConditions({ forecast, current }) {
  const humidity = current ? current.humidity : 0;

  return (
    <div className="bg-[#1E1E1E] p-6 overflow-y-auto rounded-2xl">
      <h2 className="text-lg font-medium mb-4 text-[#B0B0B0]">AIR CONDITIONS</h2>
      <div className="grid grid-cols-2 gap-4">
        {current && (
          <>
            <AirConditionItem
              label="Real Feel"
              value={`${current.feelslike_c}°C`}
              icon={<Sun />}
            />
            <AirConditionItem
              label="Wind"
              value={`${current.wind_kph} km/h`}
              icon={<Wind />}
            />
            <AirConditionItem
              label="Humidity"
              value={`${current.humidity}%`}
              icon={<Droplets />}
            />
            <AirConditionItem
              label="UV Index"
              value={current.uv}
              icon={<Sun />}
            />

            {/* Circular Humidity Visualization with Wave Effect */}
            <div className="flex flex-col items-center justify-center mt-8 h-full">
  <h2 className="text-xl font-medium mb-0 text-[#B0B0B0] ">
    Humidity Percentage
  </h2>
  <div
    className="circle justify-center mx-auto w-32 h-32 rounded-full relative border-4"
    style={{
      height: '150px',
      width: '150px',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div
      className="wave absolute bottom-0 w-full rounded-full bg-[#FF4081]"
      style={{
        height: `${humidity}%`, // Set the height dynamically based on humidity
        transition: 'height 2s ease-out', // Smooth animation for water fill
      }}
    ></div>
    <div
      className="text-center text-[#FF4081] absolute inset-0 flex items-center justify-center font-semibold"
    >
      {humidity}%
    </div>
  </div>
</div>

          </>
        )}
      </div>
    </div>
  );
}





// Reusable AirConditionItem Component
function AirConditionItem({ label, value, icon }) {
  return (
    <div className="flex gap-4">
      <div className="flex items-center justify-center h-12 w-12 bg-[#333333] text-[#E0E0E0] rounded-md">
        {icon}
      </div>
      <div>
        <p className="text-sm text-[#B0B0B0]">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}
