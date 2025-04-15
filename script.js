async function getWeather(city) {
    const apiKey = '7a08a5f41bc17fa8f76a40450d124171';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=fr&appid=${apiKey}`;
    try {
      const response = await fetch(apiUrl);
      if (response.status === 401) return { data: null, error: 'Clé API invalide' };
      if (response.status === 404) return { data: null, error: 'Ville introuvable' };
      if (!response.ok) throw new Error(`Erreur : ${response.status}`);
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des données météo :', error);
      return { data: null, error: 'Erreur réseau ou API indisponible' };
    }
}

async function getForecast(city) {
    const apiKey = '7a08a5f41bc17fa8f76a40450d124171';
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&lang=fr&appid=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (response.status === 401) return { data: null, error: 'Clé API invalide' };
        if (response.status === 404) return { data: null, error: 'Ville introuvable' };
        if (!response.ok) throw new Error(`Erreur : ${response.status}`);
        const data = await response.json();
        return { data, error: null };
    } catch (error) {
        console.error('Erreur lors de la récupération des prévisions météo :', error);
        return { data: null, error: 'Erreur réseau ou API indisponible' };
    }
}

async function showWeather(city) {
    const result = await getWeather(city);
    const forecastResult = await getForecast(city);
    const errorMessage = document.getElementById('error-message');
    const weatherDisplay = document.getElementById('weather-display');
    const forecastDisplay = document.getElementById('forecast-display');

    if (result.error || !weatherDisplay) {
        if (errorMessage) {
            errorMessage.textContent = result.error || 'Élément d\'affichage manquant';
            errorMessage.style.display = 'block';
        }
        if (weatherDisplay) weatherDisplay.style.display = 'none';
        return;
    }

    const data = result.data;
    weatherDisplay.style.display = 'block';
    document.getElementById('location').textContent = data.name || 'N/A';
    const iconCode = data.weather?.[0]?.icon || 'default';
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById('weather-icon').alt = data.weather?.[0]?.description || 'Icône météo';
    document.getElementById('weather-main').textContent = data.weather?.[0]?.description || 'N/A';
    document.getElementById('main-temperature').textContent = data.main?.temp != null ? `${data.main.temp} °C` : 'N/A';
    document.getElementById('feels-like').textContent = data.main?.feels_like != null ? `${data.main.feels_like} °C` : 'N/A';
    document.getElementById('humidity').textContent = data.main?.humidity != null ? `${data.main.humidity}%` : 'N/A';
    document.getElementById('wind').textContent = data.wind?.speed != null ? `${data.wind.speed} m/s` : 'N/A';
    document.getElementById('wind-gust').textContent = data.wind?.gust != null ? `${data.wind.gust} m/s` : 'N/A';

    // Afficher les prévisions météo sur 5 jours
    if (forecastResult.data) {
        const forecastData = forecastResult.data.list;
        forecastDisplay.innerHTML = ''; // Réinitialiser les prévisions
        for (let i = 0; i < forecastData.length; i += 8) { // 8 entrées par jour
            const forecast = forecastData[i];
            const forecastElement = document.createElement('div');
            forecastElement.classList.add('forecast-item');
            forecastElement.innerHTML = `
                <p><strong>${new Date(forecast.dt_txt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong></p>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
                <p>${forecast.weather[0].description}</p>
                <p>Température : ${forecast.main.temp} °C</p>
                <p>Humidité : ${forecast.main.humidity}%</p>
            `;
            forecastDisplay.appendChild(forecastElement);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const getForecastBtn = document.getElementById('get-forecast');
    const errorMessage = document.getElementById('error-message');

    // Fonction pour gérer la validation
    const validateCity = async () => {
        const city = cityInput.value.trim();
        if (!city) {
            errorMessage.textContent = 'Veuillez entrer le nom d\'une ville.';
            errorMessage.style.display = 'block';
            return;
        }
        errorMessage.textContent = 'Chargement...';
        errorMessage.style.display = 'block';
        getForecastBtn.disabled = true;
        await showWeather(city);
        getForecastBtn.disabled = false;
        !document.getElementById('weather-display').style.display === 'block'
            ? (errorMessage.style.display = 'block')
            : (errorMessage.style.display = 'none');
    };

    // Gestion du clic sur le bouton
    getForecastBtn.addEventListener('click', validateCity);

    // Gestion de la touche "Entrée" dans le champ de saisie
    cityInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            await validateCity();
        }
    });
});

document.body.insertAdjacentHTML(
    'beforeend',
    '<p id="error-message" style="color: red; display: none;">Nom de ville invalide. Veuillez réessayer.</p>'
);

document.body.insertAdjacentHTML(
    'beforeend',
    '<div class="forecast-display" id="forecast-display" style="display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 2rem;"><!-- Les prévisions météo seront insérées ici --></div>'
);
