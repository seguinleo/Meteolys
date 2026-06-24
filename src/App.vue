<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { createWeatherChart } from '@/charts/weatherChart'
import { getWeatherConfig } from '@/theme/weatherConfig'
import { getWeatherTheme } from '@/theme/weatherTheme'
import {
  parseVigilance,
  getGlobalVigilance
} from '@/france/meteoFrance'
import RainGauge from '@/components/RainGauge.vue'

const city = ref('')
const location = ref(null)
const cityResults = ref([])
const showCityResults = ref(false)
const loading = ref(false)
const error = ref('')
const weatherModel = ref('')
const weather = ref(null)
const aqi = ref(null)
const currentImage = ref(null)
const vigilance = ref(null)
const selectedDayIndex = ref(1)
const chartRef = ref(null)
let chartInstance = null
const chartSelectedDayRef = ref(null)
let chartSelectedDayInstance = null
const showAlertModal = ref(false)
const showComponents = ref(false)

let resizeTimeout = null

const handleResize = () => {
  clearTimeout(resizeTimeout)

  resizeTimeout = setTimeout(() => {
    chartInstance?.resize()
    chartSelectedDayInstance?.resize()
  }, 100)
}

let errorTimeout = null

const setError = (msg) => {
  error.value = msg

  clearTimeout(errorTimeout)
  errorTimeout = setTimeout(() => {
    error.value = ''
  }, 5000)
}

const changeModel = async (model) => {
  if (loading.value) return
  if (weatherModel.value === model) weatherModel.value = ''
  else weatherModel.value = model

  if (location.value) {
    await selectCity(location.value)
  }
}

const fetchWeather = async () => {
  if (loading.value) return

  weather.value = null
  vigilance.value = null
  weatherModel.value = ''

  const cityName = city.value.trim()

  if (!cityName) {
    setError('Veuillez saisir une ville')
    return
  }

  loading.value = true

  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=fr&format=json`
    )

    if (!geoResponse.ok) {
      setError('Erreur lors de la recherche de la ville')
      return
    }

    const geoData = await geoResponse.json()

    if (!geoData.results || geoData.results.length === 0) {
      setError('Ville introuvable')
      return
    }

    cityResults.value = geoData.results
    showCityResults.value = true
  } catch (err) {
    setError(err.message)
  } finally {
    loading.value = false
  }
}

const selectCity = async (selectedCity) => {
  if (loading.value) return

  try {
    loading.value = true

    location.value = selectedCity

    showCityResults.value = false

    const modelParam =
      weatherModel.value
        ? `&models=${weatherModel.value}`
        : ''

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${location.value.latitude}&longitude=${location.value.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,sunshine_duration&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,uv_index,is_day,surface_pressure,apparent_temperature,cloud_cover,wind_speed_10m,wind_direction_10m,sunshine_duration&current=uv_index,temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover&minutely_15=temperature_2m,precipitation,weather_code,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,rain&timezone=auto${modelParam}`

    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.value.latitude}&longitude=${location.value.longitude}&hourly=pm10,pm2_5&current=european_aqi`

    const [weatherResponse, aqiResponse] = await Promise.all([
      fetch(weatherUrl),
      fetch(aqiUrl)
    ])

    if (!weatherResponse.ok) {
      setError('Erreur lors de la récupération des données météo')
      return
    }

    if (!aqiResponse.ok) {
      setError('Erreur lors de la récupération de la qualité de l\'air')
      return
    }

    const weatherData = await weatherResponse.json()
    const aqiData = await aqiResponse.json()

    weather.value = {
      city: location.value.name,
      current: weatherData.current,
      hourly: weatherData.hourly,
      daily: weatherData.daily,
      minutely: weatherData.minutely_15
    }

    aqi.value = aqiData

    currentImage.value = getWeatherImage(
      weatherData.current.weather_code,
      weatherData.current.is_day
    )

    showComponents.value = true

    chartInstance = await renderWeatherChart({
      chartRef,
      instance: chartInstance,
      data: todayChart.value,
      currentHour: getCurrentHourIndex()
    })

    chartSelectedDayInstance = await renderWeatherChart({
      chartRef: chartSelectedDayRef,
      instance: chartSelectedDayInstance,
      data: selectedDayChart.value
    })

    localStorage.setItem(
      'city',
      location.value.name
    )

    if (location.value?.country === 'France') {
      let depCode = null

      const dep = location.value?.admin2

      const CORSE_MAP = {
        "Corse-du-Sud": "2A",
        "Haute-Corse": "2B"
      }

      depCode = CORSE_MAP[dep] || null

      if (!depCode) {
        const raw = location.value?.postcodes?.find(p => /\d{5}/.test(p))

        depCode = raw
          ? raw.match(/\d{5}/)[0].slice(0, 2)
          : null
      }

      if (depCode) {
        try {
          const res = await fetch(`/api/vigilance/${depCode}`)

          if (!res.ok) throw new Error()

          vigilance.value = await res.json()
        } catch {
          setError('Erreur alertes météo')
          vigilance.value = null
        }
      }
    }
  } catch (err) {
    setError(err.message)
  } finally {
    loading.value = false
  }
}

const getWeatherImage = (code, isDay) => {
  const config = getWeatherConfig(code)
  if (!config) return '/assets/icons/error.svg'

  const icon = isDay ? config.icon : config.iconNight
  return `/assets/icons/${icon}.svg`
}

const weatherConfig = computed(() =>
  weather.value?.current?.weather_code != null
    ? getWeatherConfig(weather.value.current.weather_code)
    : null
)

const theme = computed(() => {
  const current = weather.value?.current
  if (!current) return null

  return getWeatherTheme(
    current.weather_code,
    current.is_day
  )
})

const vigilanceAlerts = computed(() =>
  parseVigilance(vigilance.value)
)

const globalVigilance = computed(() =>
  getGlobalVigilance(vigilance.value)
)

const renderWeatherChart = async ({
  chartRef,
  instance,
  data,
  currentHour = null
}) => {
  await nextTick()

  if (!chartRef.value) return null

  instance?.dispose()

  return createWeatherChart(
    chartRef.value,
    data,
    currentHour
  )
}

const buildChartData = (start, end) => {
  const hourly = weather.value?.hourly

  if (!hourly) return []

  return hourly.time.slice(start, end).map((time, i) => {
    const index = i + start

    return {
      hour: new Date(time).getHours(),
      temp: hourly.temperature_2m[index],
      precipitation_proba: hourly.precipitation_probability[index],
      precipitation: hourly.precipitation[index],
      wind: hourly.wind_speed_10m[index],
      wind_direction: hourly.wind_direction_10m[index],
      humidity: hourly.relative_humidity_2m[index],
      uv: hourly.uv_index[index]?.toFixed(0),
      pressure: hourly.surface_pressure[index],
      weather: hourly.weather_code[index],
      isDay: hourly.is_day[index]
    }
  })
}

const todayChart = computed(() => buildChartData(0, 24))

const selectedDayChart = computed(() => {
  const start = selectedDayIndex.value * 24
  const end = start + 24

  return buildChartData(start, end)
})

const dailyForecast = computed(() => {
  if (!weather.value?.daily) return []

  return weather.value.daily.time
    .slice(1).map((date, index) => {
      const i = index + 1
      return {
        date,
        weather: weather.value.daily.weather_code[i],
        max: weather.value.daily.temperature_2m_max[i],
        min: weather.value.daily.temperature_2m_min[i],
        proba_max: weather.value.daily.precipitation_probability_max[i]
      }
    })
})

const getCurrentHourIndex = () => {
  const hourly = weather.value?.hourly
  const currentTime = weather.value?.current?.time

  if (!hourly?.time || !currentTime) return null

  const currentHour = currentTime.slice(0, 13)

  return hourly.time.findIndex(t =>
    t.slice(0, 13) === currentHour
  )
}

const rainData = computed(() => {
  const m = weather.value?.minutely
  const currentTime = weather.value?.current?.time

  if (!m || !currentTime) return []

  const start = Math.max(
    m.time.findIndex(t => t >= currentTime),
    0
  )

  return m.time
    .slice(start, start + 16)
    .map((time, i) => ({
      time,
      precipitation: Number(
        m.precipitation[start + i] ?? 0
      )
    }))
})

onMounted(() => {
  const savedCity = localStorage.getItem('city')
  if (savedCity) city.value = savedCity
  window.addEventListener('resize', handleResize)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .catch(err => console.warn('PWA registration failed:', err))
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  chartInstance?.dispose()
  chartSelectedDayInstance?.dispose()
})

watch(theme, (t) => {
  if (!t) return

  document.body.style.background = t.background
  document.body.style.color = t.text
}, { immediate: true })

watch(selectedDayChart, async (data) => {
  chartSelectedDayInstance = await renderWeatherChart({
    chartRef: chartSelectedDayRef,
    instance: chartSelectedDayInstance,
    data
  })
})
</script>

<template>
  <dialog v-if="location?.country === 'France' && globalVigilance" :open="showComponents && showAlertModal"
    class="alert-dialog">
    <div class="alert-header">
      <button class="close-dialog" @click="showAlertModal = false">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24">
          <path fill="#fff"
            d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z" />
        </svg>
      </button>
    </div>
    <h2>
      Alertes vigilance
      <a href="https://meteofrance.com/" rel="noopener noreferrer">Météo-France</a>
    </h2>
    <div v-for="alert in vigilanceAlerts" :key="alert.id" class="vigilance-card" :class="alert.color.class">
      <h3>
        {{ alert.icon }}
        {{ alert.type }}
      </h3>
      <p>VIGILANCE {{ alert.level }}</p>
    </div>
  </dialog>
  <div class="wrapper">
    <header :class="showComponents ? 'flex' : ''">
      <template v-if="showComponents">
        <div>
          <p>
            <span>
              {{ new Date(weather?.current?.time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }) }}
            </span>
            {{ location?.name }}, {{ location?.country_code }}
          </p>
        </div>
        <div>
          <button type="button" aria-label="Recherche" @click="showComponents = false">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path fill="#fff"
                d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z" />
            </svg>
          </button>
        </div>
      </template>
      <h1 v-else>
        Météolys
      </h1>
      <div v-if="error" id="error-notification">
        {{ error }}
      </div>
    </header>
    <main>
      <form v-if="!showComponents" @submit.prevent="fetchWeather">
        <div class="input-part">
          <p v-if="loading" class="loading">
            Chargement...
          </p>
          <input id="city" v-model="city" type="text" placeholder="Paris, FR" maxlength="50"
            aria-label="Rechercher une ville" required>
          <button type="submit" :disabled="loading">
            Rechercher
          </button>
          <div v-if="showCityResults" class="city-results">
            <button v-for="result in cityResults" :key="result.id" type="button" class="city-result"
              @click="selectCity(result)">
              {{ result.name }},
              {{ result.admin2 || result.admin1 }},
              {{ result.country_code }}
            </button>
          </div>
        </div>
      </form>
      <template v-if="showComponents">
        <section class="align-center">
          <button v-if="globalVigilance" type="button" class="vigilance-message" :class="globalVigilance.class"
            @click="showAlertModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 640 640">
              <path fill="#000"
                d="M320 64C334.7 64 348.2 72.1 355.2 85L571.2 485C577.9 497.4 577.6 512.4 570.4 524.5C563.2 536.6 550.1 544 536 544L104 544C89.9 544 76.8 536.6 69.6 524.5C62.4 512.4 62.1 497.4 68.8 485L284.8 85C291.8 72.1 305.3 64 320 64zM320 416C302.3 416 288 430.3 288 448C288 465.7 302.3 480 320 480C337.7 480 352 465.7 352 448C352 430.3 337.7 416 320 416zM320 224C301.8 224 287.3 239.5 288.6 257.7L296 361.7C296.9 374.2 307.4 384 319.9 384C332.5 384 342.9 374.3 343.8 361.7L351.2 257.7C352.5 239.5 338.1 224 319.8 224z" />
            </svg>
            <span>
              VIGILANCE
              {{ globalVigilance.label }}
            </span>
          </button>
        </section>
        <section>
          <div class="main-info">
            <div class="temp">
              <img :src="currentImage" alt="main image" width="80">
            </div>
            <div class="temp">
              <span class="main-temp">
                {{ weather?.current?.temperature_2m }}
                °C
              </span>
              <span class="line">
                {{ weatherConfig?.label }}
              </span>
              <span class="line">
                ressenti {{ weather?.current?.apparent_temperature }}
                °C
              </span>
              <span v-if="weather?.current?.uv_index" class="line">
                UV {{ weather?.current?.uv_index?.toFixed(0) }}
              </span>
            </div>
          </div>
          <div class="details">
            <div class="column">
              <div class="detail">
                <span>
                  {{ weather?.current?.relative_humidity_2m }}
                  %
                </span>
                <p class="small">Humidité</p>
              </div>
            </div>
            <div class="column">
              <div class="detail">
                <svg width="18" height="18" viewBox="0 0 50 50">
                  <path d="M25 5 L40 45 L25 35 L10 45 Z" fill="#fff"
                    :transform="`rotate(${(weather?.current?.wind_direction_10m ?? 0) + 180} 25 25)`" />
                </svg>
                <span>
                  {{ weather?.current?.wind_speed_10m }}
                  km/h
                </span>
                <p class="small">Vent</p>
              </div>
            </div>
            <div class="column">
              <div class="detail">
                <span>
                  {{ weather?.current?.surface_pressure }}
                  hPa
                </span>
                <p class="small">Pression</p>
              </div>
            </div>
          </div>
        </section>
        <section>
          <RainGauge :minutely="rainData" />
        </section>
        <section class="align-center">
          <p class="small">Aujourd'hui</p>
          <div ref="chartRef" class="chart"></div>
          <div class="images-chart">
            <img v-for="(item, index) in todayChart" :key="index" :src="getWeatherImage(item.weather, item.isDay)"
              width="12" height="12" alt="">
          </div>
        </section>
        <section class="align-center">
          <p class="small">
            {{ new Date(weather.daily.time[selectedDayIndex]).toLocaleDateString([], { weekday: 'short' }) }}
          </p>
          <div ref="chartSelectedDayRef" class="chart"></div>
          <div class="images-chart">
            <img v-for="(item, index) in selectedDayChart" :key="index" :src="getWeatherImage(item.weather, item.isDay)"
              width="12" height="12" alt="">
          </div>
        </section>
        <section class="daydetails">
          <button v-for="(day, index) in dailyForecast" :key="index" class="column daycolumn"
            @click="selectedDayIndex = index + 1">
            <p>
              {{ new Date(day.date).toLocaleDateString([], { weekday: 'short' }) }}
            </p>
            <img :src="getWeatherImage(day.weather, true)" width="48" height="48" alt="" />
            <p v-if="day.min !== null" class="small">
              <span class="min">{{ Math.round(day.min) }}°</span>
              |
              <span class="max">{{ Math.round(day.max) }}°</span>
            </p>
            <p v-if="day.proba_max !== null" class="small">🌧 {{ day.proba_max || 0 }}%</p>
          </button>
        </section>
        <section class="plus-info">
          <div>
            <p class="small">Qualité air</p>
            <p>AQI {{ aqi?.current?.european_aqi }}</p>
          </div>
          <div>
            <p class="small">Couverture nuageuse</p>
            <p>{{ weather?.current?.cloud_cover }}%</p>
          </div>
          <div>
            <p class="small">Lever soleil</p>
            <p>{{ new Date(weather?.daily?.sunrise[0]).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }) }}</p>
          </div>
          <div>
            <p class="small">Coucher soleil</p>
            <p>{{ new Date(weather?.daily?.sunset[0]).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }) }}</p>
          </div>
          <div>
            <p class="small">Latitude</p>
            <p>{{ location?.latitude }}</p>
          </div>
          <div>
            <p class="small">Longitude</p>
            <p>{{ location?.longitude }}</p>
          </div>
        </section>
        <section v-if="location?.country === 'France'">
          <p class="small">Modèles Météo-France</p>
          <div class="model-switch">
            <button type="button" :class="{ active: weatherModel === 'meteofrance_arome_france' }"
              @click="changeModel('meteofrance_arome_france')">
              AROME
            </button>
            <button type="button" :class="{ active: weatherModel === 'meteofrance_arome_france_hd' }"
              @click="changeModel('meteofrance_arome_france_hd')">
              AROME HD
            </button>
            <button type="button" :class="{ active: weatherModel === 'meteofrance_arpege_europe' }"
              @click="changeModel('meteofrance_arpege_europe')">
              ARPEGE
            </button>
          </div>
          <p class="d-flex small">
            <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="14px">
                <path fill="#fff"
                  d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM288 224C288 206.3 302.3 192 320 192C337.7 192 352 206.3 352 224C352 241.7 337.7 256 320 256C302.3 256 288 241.7 288 224zM280 288L328 288C341.3 288 352 298.7 352 312L352 400L360 400C373.3 400 384 410.7 384 424C384 437.3 373.3 448 360 448L280 448C266.7 448 256 437.3 256 424C256 410.7 266.7 400 280 400L304 400L304 336L280 336C266.7 336 256 325.3 256 312C256 298.7 266.7 288 280 288z" />
              </svg></span>
            <span>Le modèle utilisé par défaut est le plus adapté à votre localisation. Les modèles Météo-France
              permettent d'obtenir des prévisions affinées (précipitations, orages...).</span>
          </p>
        </section>
        <footer>
          Données
          <a href="https://open-meteo.com" rel="noopener noreferrer">
            Open-Meteo
          </a>
        </footer>
      </template>
    </main>
    <footer v-if="!showComponents">
      GPL-3.0
      <a href="https://leoseguin.fr/" rel="noopener noreferrer">
        leoseguin.fr
      </a>
    </footer>
  </div>
</template>
