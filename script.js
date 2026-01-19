const API_KEY = "58f73b468d5a60232a0d0bc2150cc3bc";
const BASE_URL = "https://api.openweathermap.org/data/2.5/";


const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherCard = document.getElementById('weather-card');
const forecastCard = document.getElementById('forecast-card');
const loader = document.getElementById('loader');
const errorMsg = document.getElementById('error-msg');

async function getWeatherData(query) {
    if (!loader) return;
    loader.style.display = "block";
    errorMsg.innerText = "";
    if (weatherCard) weatherCard.style.display = "none";
    if (forecastCard) forecastCard.style.display = "none";

    try {
        const currentRes = await fetch(`${BASE_URL}weather?${query}&units=metric&appid=${API_KEY}`);
        const currentData = await currentRes.json();

        const forecastRes = await fetch(`${BASE_URL}forecast?${query}&units=metric&appid=${API_KEY}`);
        const forecastData = await forecastRes.json();

        if (currentRes.status === 404) throw new Error("City not found! Please try again.");

        updateHeroAndGrid(currentData);
        updateForecast(forecastData);
        updateDynamicBackground(currentData.weather[0].main.toLowerCase());

    } catch (err) {
        errorMsg.innerText = err.message;
    } finally {
        loader.style.display = "none";
    }
}


function updateHeroAndGrid(data) {
    if (!weatherCard) return;
    document.getElementById('city-name').innerText = `${data.name}, ${data.sys.country}`;
    document.getElementById('temp').innerText = `${Math.round(data.main.temp)}°C`;
    document.getElementById('desc').innerText = data.weather[0].description;
    document.getElementById('current-date').innerText = new Date().toDateString();

    document.getElementById('humidity').innerText = `${data.main.humidity}%`;
    document.getElementById('wind').innerText = `${data.wind.speed} km/h`;
    document.getElementById('pressure').innerText = `${data.main.pressure} hPa`;
    document.getElementById('visibility').innerText = `${(data.visibility / 1000).toFixed(1)} km`;

    const iconCode = data.weather[0].icon;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    weatherCard.style.display = "block";
}


function updateForecast(data) {
    const list = document.getElementById('forecast-list');
    if (!list) return;
    list.innerHTML = "";

    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.forEach(day => {
        const dayName = new Date(day.dt * 1000).toLocaleDateString('en', { weekday: 'short' });
        list.innerHTML += `
            <div class="forecast-item">
                <p>${dayName}</p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <p><b>${Math.round(day.main.temp)}°C</b></p>
            </div>
        `;
    });
    forecastCard.style.display = "block";
}


function updateDynamicBackground(condition) {
    const body = document.getElementById('body-bg');
    if (!body) return;
    body.className = "";
    if (condition.includes("clear")) body.classList.add('clear');
    else if (condition.includes("cloud")) body.classList.add('clouds');
    else if (condition.includes("rain") || condition.includes("drizzle")) body.classList.add('rain');
    else if (condition.includes("snow")) body.classList.add('snow');
}


document.getElementById('location-btn')?.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(pos => {
        getWeatherData(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
    }, () => { alert("Location access denied."); });
});

document.getElementById('fav-btn')?.addEventListener('click', () => {
    const cityText = document.getElementById('city-name').innerText;
    if(!cityText || cityText === "--") return;
    const city = cityText.split(',')[0];
    let favs = JSON.parse(localStorage.getItem('favCities')) || [];
    if (!favs.includes(city)) {
        favs.push(city);
        localStorage.setItem('favCities', JSON.stringify(favs));
        renderFavs();
    }
});

function renderFavs() {
    const container = document.getElementById('fav-list');
    if (!container) return;
    const favs = JSON.parse(localStorage.getItem('favCities')) || [];
    container.innerHTML = favs.map(c => `<button onclick="getWeatherData('q=${c}')">${c}</button>`).join('');
}


searchBtn?.addEventListener('click', () => {
    if(cityInput.value) getWeatherData(`q=${cityInput.value}`);
});
cityInput?.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter' && cityInput.value) getWeatherData(`q=${cityInput.value}`); 
});


window.addEventListener('load', () => {
    renderFavs();
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                
                getWeatherData(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
            },
            () => {
                
                getWeatherData(`q=Dhaka`);
            }
        );
    } else {
       
        getWeatherData(`q=Dhaka`);
    }
});