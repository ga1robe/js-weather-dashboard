import React, { useEffect, useState, useCallback } from "react";
import * as d3 from "d3";

const API_KEY = "{api_key}"; // Insert API key of OpenWeatherMap
const CITY = "Warszawa"; // You can chage city

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState([]);

  const renderChart = useCallback((data) => {
    const svg = d3.select("#weather-chart");
    svg.selectAll("*").remove();

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.temp) - 2,
        d3.max(data, (d) => d.temp) + 2,
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.temp));

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0)
      );

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  }, []);

  const fetchWeatherData = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();
      const forecast = data.list.map((item) => ({
        date: new Date(item.dt * 1000),
        temp: item.main.temp,
        description: item.weather[0].description,
      }));
      setWeatherData(forecast);
      renderChart(forecast);
    } catch (error) {
      console.error("[Error] Weather data download error:", error);
    }
  }, [renderChart]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  return (
    <div>
      <h2>Prognoza Pogody dla {CITY}</h2>
      <svg id="weather-chart" width="600" height="300"></svg>
      <ul>
        {weatherData.map((item, index) => (
          <li key={index}>
            {item.date.toLocaleString()}: {item.temp}°C, {item.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WeatherDashboard;
