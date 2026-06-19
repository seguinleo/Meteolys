import * as echarts from 'echarts'

export function createWeatherChart(el, data, currentHour) {
  const chart = echarts.init(el)
  const temps = data.map(i => i.temp)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const yMin = Math.floor(minTemp - 2)
  const yMax = Math.ceil(maxTemp + 2)

  const markLine =
    currentHour !== null
      ? {
        markLine: {
          symbol: 'none',
          label: {
            formatter: '',
            color: '#fff'
          },
          lineStyle: {
            color: '#ffcc00',
            width: 1,
            type: 'dashed'
          },
          data: [{ xAxis: currentHour }]
        }
      }
      : {}

  chart.setOption({
    grid: {
      top: 10,
      left: 4,
      right: 4,
      bottom: 20
    },

    tooltip: {
      trigger: 'axis',
      textStyle: {
        align: 'left'
      },
      formatter: (params) => {
        const d = params[0].data

        if (!d) return ''

        return `
          <b>${d.hour}h</b><br/>
          🌡️ Temp : ${d.value}°C<br/>
          💨 Vent : <svg width="18" height="18" viewBox="0 0 50 50">
              <path d="M25 5 L40 45 L25 35 L10 45 Z" fill="currentColor"
                transform="rotate(${(d.wind_direction ?? 0) + 180} 25 25)" />
            </svg> ${d.wind}km/h<br/>
          💧 Humidité : ${d.humidity}%<br/>
          🌧️ Proba. pluie : ${d.precipitation_proba}%<br/>
          🌧️ Précipita. : ${d.precipitation}mm<br/>
          ☀️ UV : ${d.uv}<br/>
          ⛰️ Pression : ${d.pressure}hPa
        `
      }
    },

    xAxis: {
      type: 'category',
      data: data.map(i => i.hour),
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        show: false
      }
    },

    yAxis: [
      { type: 'value', show: false, min: yMin, max: yMax },
      { type: 'value', show: false }
    ],

    series: [
      {
        type: 'line',
        smooth: true,
        data: data.map(i => ({
          value: i.temp,
          wind: i.wind,
          wind_direction: i.wind_direction,
          humidity: i.humidity,
          precipitation_proba: i.precipitation_proba,
          precipitation: i.precipitation,
          uv: i.uv,
          pressure: i.pressure,
          hour: i.hour
        })),
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, color: 'rgba(255,255,255,.8)' },
        itemStyle: { color: '#fff' },
        ...markLine
      },
      {
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: data.map(i => i.precipitation),
        lineStyle: { width: 3, color: 'rgba(57,196,243,.8)' },
        itemStyle: { color: '#39c4f3' }
      },
    ]
  })

  return chart
}
