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
    codes: [1, 2],
    icon: 'fewclouds',
    iconNight: 'fewcloudsNight',
    label: 'Partiellement nuageux',
    day: '#5198df',
    night: '#2f1b5b'
  },
  {
    codes: [3],
    icon: 'clouds',
    iconNight: 'clouds',
    label: 'Nuageux',
    day: '#5a7c8f',
    night: '#372759'
  },
  {
    codes: [45, 48],
    icon: 'fog',
    iconNight: 'fogNight',
    label: 'Brouillard',
    day: '#6e9bb8',
    night: '#433267'
  },
  {
    codes: [51, 53, 55, 56, 57],
    icon: 'drizzle',
    iconNight: 'drizzle',
    label: 'Bruine',
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
    codes: [80, 81, 82],
    icon: 'shower',
    iconNight: 'shower',
    label: 'Averses',
    day: '#3f5f7a',
    night: '#2c243f'
  },
  {
    codes: [66, 67],
    icon: 'rain',
    iconNight: 'rain',
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
    codes: [77, 85, 86],
    icon: 'snow',
    iconNight: 'snow',
    label: 'Averses de neige',
    day: '#6e9bb8',
    night: '#433267'
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
    icon: 'storm',
    iconNight: 'storm',
    label: 'Orage violent',
    day: '#2f4353',
    night: '#1c1726'
  }
]

export const getWeatherConfig = (code) => {
  return weatherConfig.find(c => c.codes.includes(code))
}
