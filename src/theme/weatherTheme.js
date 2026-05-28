import { getWeatherConfig } from '@/theme/weatherConfig'

export function getWeatherTheme(code, isDay) {
  const config = getWeatherConfig(code)

  if (!config) {
    return {
      name: 'default',
      background: isDay ? '#4aa3ff' : '#1b1f2a',
      text: '#ffffff'
    }
  }

  return {
    name: config.codes[0].toString(),
    background: isDay ? config.day : config.night,
    text: '#ffffff'
  }
}
