/*=========================================
    Weather Dashboard
    script.js
    Part 1
=========================================*/

//============== API ==============//

const API_KEY = "b7cfa9418e01ef358efafecb323b6670";

const CURRENT_WEATHER_URL =
    "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_URL =
    "https://api.openweathermap.org/data/2.5/forecast";

//============== DOM Elements ==============//

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const themeToggle = document.getElementById("themeToggle");

const currentDate = document.getElementById("currentDate");

const cityName = document.getElementById("cityName");
const country = document.getElementById("country");

const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const detailsFeelsLike = document.getElementById("detailsFeelsLike");

const weatherDescription = document.getElementById("weatherDescription");
const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const uvIndex = document.getElementById("uvIndex");

const tempMax = document.getElementById("tempMax");
const tempMin = document.getElementById("tempMin");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const forecastContainer = document.getElementById("forecastContainer");

const recentSearches = document.getElementById("recentSearches");

const loader = document.getElementById("loader");
const errorBox = document.getElementById("errorBox");

//============== Current Date ==============//

function updateCurrentDate() {

    const today = new Date();

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    currentDate.textContent =
        today.toLocaleDateString("en-US", options);

}

updateCurrentDate();

//============== Theme Toggle ==============//

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const icon = themeToggle.querySelector("i");

    if (document.body.classList.contains("dark")) {

        icon.className = "fa-solid fa-sun";

        localStorage.setItem("theme", "dark");

    } else {

        icon.className = "fa-solid fa-moon";

        localStorage.setItem("theme", "light");

    }

});

//============== Load Saved Theme ==============//

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeToggle.querySelector("i").className =
        "fa-solid fa-sun";

}

//============== Search Events ==============//

searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (!city) return;

    getWeather(city);

});

cityInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        searchBtn.click();

    }

});


async function getWeather(city) {

    showLoader();

    hideError();

    try {

        const response = await fetch(
            `${CURRENT_WEATHER_URL}?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {

            throw new Error("City not found");

        }

        const data = await response.json();
        console.log(data);

        displayCurrentWeather(data);

        saveRecentSearch(city);

        getForecast(city);

    } catch (error) {

        console.error(error);

        showError();

    } finally {

        hideLoader();

    }

}

//=========================================//
// Display Current Weather
//=========================================//

function displayCurrentWeather(data) {

    cityName.textContent = data.name;

    country.textContent = data.sys.country;

    temperature.textContent =
        `${Math.round(data.main.temp)}°C`;

    feelsLike.textContent =
        `${Math.round(data.main.feels_like)}°C`;

    detailsFeelsLike.textContent =
        `${Math.round(data.main.feels_like)}°C`;

    tempMax.textContent =
        `${Math.round(data.main.temp_max)}°C`;

    tempMin.textContent =
        `${Math.round(data.main.temp_min)}°C`;

    humidity.textContent =
        `${data.main.humidity}%`;

    windSpeed.textContent =
        `${data.wind.speed} km/h`;

    pressure.textContent =
        `${data.main.pressure} hPa`;

    visibility.textContent =
        `${(data.visibility / 1000).toFixed(1)} km`;

    weatherDescription.textContent =
        data.weather[0].description;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    const sunriseTime =
        new Date(data.sys.sunrise * 1000);

    const sunsetTime =
        new Date(data.sys.sunset * 1000);

    sunrise.textContent =
        sunriseTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    sunset.textContent =
        sunsetTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    // OpenWeather free API doesn't provide UV Index
    uvIndex.textContent = "--";

}


//=========================================//
// Part 3
// 5-Day Forecast
//=========================================//

async function getForecast(city) {

    try {

        const response = await fetch(
            `${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {

            throw new Error("Forecast not found");

        }

        const data = await response.json();

        displayForecast(data.list);

    } catch (error) {

        console.error(error);

    }

}

//=========================================//
// Display Forecast
//=========================================//

function displayForecast(forecastList) {

    forecastContainer.innerHTML = "";

    // One forecast per day (around 12:00 PM)
    const dailyForecast = forecastList.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    dailyForecast.forEach(day => {

        const date = new Date(day.dt_txt);

        const dayName = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const card = document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `
            <h3>${dayName}</h3>

            <img
                src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"
                alt="${day.weather[0].description}"
            >

            <p>${Math.round(day.main.temp)}°C</p>

            <small>${day.weather[0].main}</small>
        `;

        forecastContainer.appendChild(card);

    });

}


//=========================================//
// Part 4
// Recent Searches
//=========================================//

function saveRecentSearch(city) {

    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

    city = city.trim();

    // Remove duplicate
    cities = cities.filter(item =>
        item.toLowerCase() !== city.toLowerCase()
    );

    // Add to beginning
    cities.unshift(city);

    // Keep only last 5 cities
    if (cities.length > 5) {

        cities.pop();

    }

    localStorage.setItem(
        "recentCities",
        JSON.stringify(cities)
    );

    loadRecentSearches();

}

//=========================================//
// Load Recent Searches
//=========================================//

function loadRecentSearches() {

    const cities =
        JSON.parse(localStorage.getItem("recentCities")) || [];

    recentSearches.innerHTML = "";

    if (cities.length === 0) {

        recentSearches.innerHTML =
            "<p>No recent searches</p>";

        return;

    }

    cities.forEach(city => {

        const button = document.createElement("button");

        button.className = "recent-btn";

        button.textContent = city;

        button.addEventListener("click", () => {

            cityInput.value = city;

            getWeather(city);

        });

        recentSearches.appendChild(button);

    });

}

//=========================================//
// Clear Recent Searches
//=========================================//

function clearRecentSearches() {

    localStorage.removeItem("recentCities");

    loadRecentSearches();

}

//=========================================//
// Load Saved Searches on Startup
//=========================================//

loadRecentSearches();


//=========================================//
// Part 5
// Loader • Error • Geolocation • Startup
//=========================================//

//============== Loader ==============//

function showLoader() {

    if (loader) {

        loader.style.display = "flex";

    }

}

function hideLoader() {

    if (loader) {

        loader.style.display = "none";

    }

}

//============== Error Box ==============//

function showError() {

    if (errorBox) {

        errorBox.style.display = "block";

    }

}

function hideError() {

    if (errorBox) {

        errorBox.style.display = "none";

    }

}

//============== Geolocation ==============//

locationBtn.addEventListener("click", getCurrentLocation);

function getCurrentLocation() {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported by this browser.");

        return;

    }

    showLoader();

    navigator.geolocation.getCurrentPosition(

        async(position) => {

            try {

                const { latitude, longitude } = position.coords;

                const response = await fetch(

                    `${CURRENT_WEATHER_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`

                );

                if (!response.ok) {

                    throw new Error("Unable to fetch location weather.");

                }

                const data = await response.json();

                displayCurrentWeather(data);

                saveRecentSearch(data.name);

                getForecast(data.name);

            } catch (error) {

                console.error(error);

                showError();

            } finally {

                hideLoader();

            }

        },

        (error) => {

            console.error(error);

            hideLoader();

            alert("Location access denied.");

        }

    );

}

//============== Initial Weather ==============//

window.addEventListener("load", () => {

    hideLoader();

    getWeather("Karachi");

});