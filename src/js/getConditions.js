import {getLanguageName} from "./languageNameFromCode";

const date = new Date();
const time = date.toLocaleString('en', { hour: 'numeric', hour12: true });
const hour = date.getHours();
const timeOfDay = hour < 6 ? 'Night' : (hour < 12 ? 'Morning' : (hour < 18 ? 'Afternoon' : 'Evening'));
let   language = navigator.language || navigator.userLanguage;
language = getLanguageName(language);
const day = date.toLocaleString('en', {  weekday: 'long' });
const screenWidth = window.innerWidth;
const device = screenWidth <= 768 ? 'Mobile' : (screenWidth <= 1024 ? 'Tablet' : 'Desktop');
const os = navigator.platform;


function weatherDictionary(inputWeather) {
    const map = {
        'Clouds': 'Cloudy',
        'Clear': 'Sunny',
        'Rain': 'Rainy'
    };
    return map[inputWeather] || '?';
}


const getEnvironmentPromise = new Promise((resolve, reject) => {
  try {
    let request = new XMLHttpRequest();

    request.onreadystatechange = function() {
      if (request.readyState === 4 && request.status === 200) {

        const locationResponse = JSON.parse(request.responseText);
        const city = locationResponse.city;
        const country = locationResponse.country;

        request.onreadystatechange = function() {
          if (request.readyState === 4 && request.status === 200) {

            const weatherResponse = JSON.parse(request.response);
            const weather = weatherDictionary(weatherResponse.weather[0].main);

            resolve({
                time,
                timeOfDay,
                day,
                language,
                device,
                os,
                country,
                city,
                weather
            });
          }
        };

        request.open('GET', "https://api.openweathermap.org/data/2.5/weather?" +
          "lat=" + locationResponse.latitude + '&' +
          "lon=" + locationResponse.longitude + '&' +
          "units=metric" + '&' +
          "APPID=05233ff759e21c294b058dfe648b690b",
          true);
        request.send();
      }
    };

    request.open('GET', 'https://ipapi.co/json', true);
    request.send();
  }
  catch (e) {
    reject(e);
  }
});

export default getEnvironmentPromise;