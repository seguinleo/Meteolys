export const weatherConfig = [
  {
    codes: [0],
    icon: 'sun',
    iconNight: 'moon',
    label: 'Ciel dégagé',
    day: '#4aa3ff',
    night: '#381a79'
  },
  {
    codes: [1],
    icon: 'mostlyClear',
    iconNight: 'mostlyClearNight',
    label: 'Quelques nuages',
    day: '#5198df',
    night: '#2f1b5b'
  },
  {
    codes: [2],
    icon: 'partlyCloudy',
    iconNight: 'partlyCloudyNight',
    label: 'Partiellement nuageux',
    day: '#5198df',
    night: '#2f1b5b'
  },
  {
    codes: [3],
    icon: 'cloudy',
    iconNight: 'cloudy',
    label: 'Nuageux',
    day: '#5a7c8f',
    night: '#372759'
  },
  {
    codes: [45, 48],
    icon: 'fog',
    iconNight: 'fog',
    label: 'Brouillard',
    day: '#6e9bb8',
    night: '#433267'
  },
  {
    codes: [51, 53, 55],
    icon: 'drizzle',
    iconNight: 'drizzle',
    label: 'Bruine',
    day: '#6e9bb8',
    night: '#433267'
  },
  {
    codes: [56, 57],
    icon: 'freezingDrizzle',
    iconNight: 'freezingDrizzle',
    label: 'Bruine verglaçante',
    day: '#6e9bb8',
    night: '#433267'
  },
  {
    codes: [61, 63, 65],
    icon: 'rain',
    iconNight: 'rain',
    label: 'Pluie',
    day: '#3f5f7a',
    night: '#2c243f'
  },
  {
    codes: [66, 67],
    icon: 'freezingRain',
    iconNight: 'freezingRain',
    label: 'Pluie verglaçante',
    day: '#3f5f7a',
    night: '#2c243f'
  },
  {
    codes: [71, 73, 75],
    icon: 'snow',
    iconNight: 'snow',
    label: 'Neige',
    day: '#6e9bb8',
    night: '#433267'
  },
  {
    codes: [77],
    icon: 'snowGrains',
    iconNight: 'snowGrains',
    label: 'Flocons',
    day: '#6e9bb8',
    night: '#433267'
  },
  {
    codes: [80, 81, 82],
    icon: 'showers',
    iconNight: 'showers',
    label: 'Averses',
    day: '#2f4353',
    night: '#1c1726'
  },
  {
    codes: [85, 86],
    icon: 'snowShowers',
    iconNight: 'snowShowers',
    label: 'Averses de neige',
    day: '#2f4353',
    night: '#1c1726'
  },
  {
    codes: [95],
    icon: 'thunder',
    iconNight: 'thunder',
    label: 'Orage',
    day: '#2f4353',
    night: '#1c1726'
  },
  {
    codes: [96, 99],
    icon: 'heavyThunder',
    iconNight: 'heavyThunder',
    label: 'Orage violent',
    day: '#2f4353',
    night: '#1c1726'
  }
]

export const getWeatherConfig = (code) => {
  return weatherConfig.find(c => c.codes.includes(code))
}
