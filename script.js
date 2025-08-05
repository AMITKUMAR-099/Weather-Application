const apikey = "faba193d51b440fad1be8131c3babf58";
const apikey2 = "8a60752d9a4b4ef2b0f153556253007";
const locationelement = document.getElementById("location-name");
const dateelement = document.getElementById("currentdate");
const weatherimageelement = document.getElementById("Weather-image");
const weatherdescriptionelement = document.getElementById("weather-description")
const temperatureelement = document.getElementById("temp");
const feelelement = document.getElementById("feel");
const humidityelement = document.getElementById("humidity");
const windspeedelement = document.getElementById("wind");
const uvelement = document.getElementById("uvindex");
const aqielement = document.getElementById("aqi");
const aqilabelelement = document.getElementById("aqi-label");
const aqiindicatorelement = document.getElementById("aqi-indicator");
const sunriseelement = document.getElementById("sunrise");
const sunsetelement = document.getElementById("sunset");
const predictionelement = document.querySelectorAll(".prediction-boxes");

document.getElementById("search-bt").addEventListener('click',()=>{
    const city = document.querySelector("#cityinput").value;
    // console.log(city);
    locationelement.innerText = city;
    const today = new Date();
    const format = {weekday:"long", year:"numeric",month:"long",day:"numeric"};
    dateelement.innerHTML = today.toLocaleDateString("en-IN",format);
    weatherapp(city);
});

const weatherapp = async(city) =>{
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apikey}`;
    
    let response = await fetch(url);
    let weatherdata = await response.json();
    console.log(weatherdata);
    let temp = `${Math.round(weatherdata.main.temp)}&deg;C`;
    temperatureelement.innerHTML = temp;
    feelelement.innerHTML = `Feels like ${Math.round(weatherdata.main.feels_like)}&deg;C`;
    humidityelement.innerHTML = `${weatherdata.main.humidity}%`;
    windspeedelement.innerHTML = `${(weatherdata.wind.speed*3.6).toFixed(1)} km/h`;
    const sunriseunix = weatherdata.sys.sunrise;
    const sunsetunix = weatherdata.sys.sunset;
    const latitude = weatherdata.coord.lat;
    const longitude = weatherdata.coord.lon;
    uvindexandaqi(latitude,longitude);
    sunrisesunset(sunriseunix,sunsetunix);
    fivedaysforecast(city,temp,weatherdata.weather[0].icon);
    weathericons(weatherdata.weather[0].icon,weatherdata.weather[0].description);
}

const sunrisesunset = (sunrise,sunset) =>{
    const sunriseTime = new Date(sunrise*1000);
    const sunsetTime = new Date(sunset*1000);
    sunriseelement.innerHTML = sunriseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sunsetelement.innerHTML =  sunsetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const uvindexandaqi = async(lat,lon) =>{
    const url1 = `https://api.weatherapi.com/v1/current.json?key=${apikey2}&q=${lat},${lon}&aqi=yes`;
    let response1 = await fetch(url1);
    let data = await response1.json();
    console.log(data);
    uvelement.innerHTML = data.current.uv;
    const aqivalue = pm25ToAQI(data.current.air_quality.pm2_5);
    const aqiindicatorvalue = aqiindicate(aqivalue);
    if(aqiindicatorvalue ==="unhealthy-sens"){
        aqielement.innerHTML = aqivalue;
        aqiindicatorelement.className = `${aqiindicatorvalue}`;
        aqilabelelement.innerHTML = `(Unhealhty)`;
    }else{
        aqielement.innerHTML = aqivalue;
        aqiindicatorelement.className = `${aqiindicatorvalue}`;
        aqilabelelement.innerHTML = `(${aqiindicatorvalue})`;
    }
}

const pm25ToAQI = (pm25) => {
  const breakpoints = [
    { cLow: 0.0, cHigh: 12.0, aLow: 0, aHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, aLow: 51, aHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, aLow: 101, aHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, aLow: 151, aHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, aLow: 201, aHigh: 300 },
    { cLow: 250.5, cHigh: 500.0, aLow: 301, aHigh: 500 }
  ];
  for (let i = 0; i < breakpoints.length; i++) {
    const bp = breakpoints[i];
    if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
      return Math.round(
        ((bp.aHigh - bp.aLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.aLow
      );
    }
  }
  return -1;
}

const aqiindicate = (aqi) =>{
    if (aqi <= 50){
        return "good";
    }
    else if (aqi <= 100){
        return "moderate";
    } 
    else if (aqi <= 150){
        return "unhealthy-sens";
    } 
    else if (aqi <= 200){
        return "unhealthy";
    } 
    else if (aqi <= 300){
        return "very-unhealthy";
    } 
    else{
        return "hazardous";
    } 
}


const iconMap = {
  "01d": "sunny.png",
  "01n": "moon.png",
  "04d": "cloud.png",
  "04n": "cloud.png",
  "03d": "cloud.png",
  "03n": "cloud.png",
  "02d": "partially-cloudy.png",
  "02n": "cloudy-night.png",
  "09d": "rain.png",
  "09n": "rainy-night.png",
  "10d": "rain.png",
  "10n": "rainy-night.png",
  "11d": "stormy-rain.png",         
  "11n": "stormy-night-rain.png",
  "13d":"snow.png",
  "13n":"snow.png",
};

const forecastdate =[];
const predictiontemp=[];
const weathericonprediction = [];
const fivedaysforecast = async(city,temp,weathericon) =>{

    forecastdate.length = 0;
    predictiontemp.length = 0;
    weathericonprediction.length = 0;
    const url2 = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apikey}&units=metric`;
    let response2 = await fetch(url2);
    let data1 = await response2.json();
    console.log(data1);
    const forecastlist = data1.list;
    const today = new Date().toLocaleDateString("en-CA");
    for (let entry of forecastlist){
        const [date,time] = entry.dt_txt.split(" ");
        if(time === "12:00:00" && !forecastdate.includes(date) && date!==today){
            forecastdate.push(date); 
            predictiontemp.push(Math.round(entry.main.temp));  
            weathericonprediction.push(entry.weather[0].icon);     
        }
    }
    for (let pbox of predictionelement) {
        pbox.innerHTML = "";
    }
    let i=0;
    for(let pbox of predictionelement){
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        // if(pbox.id==="pb1"){
        //     let pdate = document.createElement("p");
        //     let pimg = document.createElement("img");
        //     pimg.id = "weather-icon";
        //     pimg.src = `weather icons/${iconMap[weathericon]}`;
        //     let ptemp = document.createElement("p");
        //     ptemp.innerHTML = temp;
        //     const [year, month, day] = today.split("-");
        //     pdate.innerHTML = `${day} ${monthNames[month-1]}`;
        //     pbox.appendChild(pdate);
        //     pbox.appendChild(pimg);
        //     pbox.appendChild(ptemp);
        // }
            let pdate = document.createElement("p");
            let pimg = document.createElement("img");
            pimg.src = `weather icons/${iconMap[weathericonprediction[i]]}`;
            let ptemp = document.createElement("p");
            const [year, month, day] = forecastdate[i].split("-");
            pdate.innerHTML = `${day} ${monthNames[month-1]}`;
            ptemp.innerHTML = predictiontemp[i]+"&deg;C";
            pbox.appendChild(pdate);
            pbox.appendChild(pimg);
            pbox.appendChild(ptemp);
            i++;
    }
}



const weathericons = (icon,description)=>{
    let result="";
    for(let i=0;i<description.length;i++){
        if(i==0 || description[i-1]==" "){
            result+=description[i].toUpperCase();
        }else{
            result+=description[i];
        }
    }
    weatherimageelement.src = `weather icons/${iconMap[icon]}`;
    weatherdescriptionelement.innerHTML = result;
}


window.addEventListener("load", () => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoords(latitude, longitude);
        },
        () => {
            // Fallback to default city
            document.getElementById("cityinput").value = "Delhi";
            weatherapp("Faridabad");
        }
    );
});

async function getWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const city = data.name;

        document.getElementById("cityinput").value = city;
        locationelement.innerText = city;
        const today = new Date();
        const format = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        dateelement.innerHTML = today.toLocaleDateString("en-IN", format);

        weatherapp(city);
    } catch (error) {
        console.error("Error fetching location-based weather:", error);
        document.getElementById("cityinput").value = "Delhi";
        weatherapp("Faridabad");
    }
}



