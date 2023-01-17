import axios from "axios";
import React, { useState, useEffect } from "react";

const Filter = ({ filter, handleFilterChange }) => {
  return (
    <>
      Find countries <input value={filter} onChange={handleFilterChange} />
    </>
  );
};

const Country = ({ country }) => {
  const [weather, setWeather] = useState({});
  const key = process.env.REACT_APP_API_KEY;
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${country.capital[0]}&appid=${key}&units=metric`;
  useEffect(() => {
    axios.get(url).then((response) => {
      setWeather(response.data);
    });
  }, [url]);
  return (
    <>
      <h1>{country.name.common}</h1>
      <p>Capital: {country.capital[0]}</p>
      <p>Population: {country.population}</p>
      <h2>Languages</h2>
      <ul>
        {Object.values(country.languages).map((language) => (
          <li key={language}>{language}</li>
        ))}
      </ul>
      <img src={country.flags.png} alt="flag" width="200" />
      <h2>Weather in {country.capital[0]}</h2>
      <p>
        <strong>Temperature:</strong> {weather.main?.temp} Celsius
      </p>
      <img
        src={`http://openweathermap.org/img/w/${weather.weather?.[0].icon}.png`}
        alt="weather icon"
      />
      <p>
        <strong>Wind:</strong> {weather.wind?.speed} mph direction{" "}
        {weather.wind?.deg}
      </p>
    </>
  );
};

const App = () => {
  const [countries, setCountries] = useState([]);
  const [filter, setFilter] = useState("");
  const [showCountry, setShowCountry] = useState(null);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setShowCountry(null);
  };

  const handleShowCountry = (country) => {
    setShowCountry(country);
  };

  useEffect(() => {
    axios.get("https://restcountries.com/v3.1/all").then((response) => {
      setCountries(response.data);
    });
  }, []);

  const countriesToShow =
    filter === ""
      ? []
      : countries.filter((country) =>
          country.name.common.toLowerCase().includes(filter.toLowerCase())
        );

  return (
    <div>
      <Filter filter={filter} handleFilterChange={handleFilterChange} />
      {countriesToShow.length > 10 ? (
        <p>Too many matches, specify another filter</p>
      ) : countriesToShow.length === 1 ? (
        <Country country={countriesToShow[0]} />
      ) : showCountry ? (
        <Country country={showCountry} />
      ) : (
        countriesToShow.map((country) => (
          <div key={country.name.common}>
            {country.name.common}
            <button onClick={() => handleShowCountry(country)}>show</button>
          </div>
        ))
      )}
    </div>
  );
};

export default App;
