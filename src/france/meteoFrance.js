export const vigilanceColors = {
  1: {
    label: '',
    class: 'green',
    hex: '#2e7d32'
  },
  2: {
    label: 'JAUNE',
    class: 'yellow',
    hex: '#f9a825'
  },
  3: {
    label: 'ORANGE',
    class: 'orange',
    hex: '#ef6c00'
  },
  4: {
    label: 'ROUGE',
    class: 'red',
    hex: '#c62828'
  }
}

export const phenomenonMap = {
  1: {
    label: 'Vent violent',
    icon: '💨'
  },
  2: {
    label: 'Pluie-inondation',
    icon: '🌧️'
  },
  3: {
    label: 'Orages',
    icon: '🌩️'
  },
  4: {
    label: 'Inondation',
    icon: '🌊'
  },
  5: {
    label: 'Neige-verglas',
    icon: '❄️'
  },
  6: {
    label: 'Canicule',
    icon: '🌡️'
  },
  7: {
    label: 'Grand froid',
    icon: '❄️'
  },
  8: {
    label: 'Avalanches',
    icon: '🏔️'
  },
  9: {
    label: 'Vagues-submersion',
    icon: '🌊'
  }
}

export const parseVigilance = (data) => {
  if (!data?.phenomenon_items) {
    return []
  }

  return data.phenomenon_items
    .filter(item => item.phenomenon_max_color_id > 1)
    .map(item => ({
      id: Number(item.phenomenon_id),

      type:
        phenomenonMap[item.phenomenon_id]?.label ||
        'Inconnu',

      icon:
        phenomenonMap[item.phenomenon_id]?.icon ||
        '⚠️',

      color:
        vigilanceColors[item.phenomenon_max_color_id],

      level:
        vigilanceColors[item.phenomenon_max_color_id]?.label,

      periods: item.timelaps_items.map(period => ({
        begin: period.begin_time,
        end: period.end_time,
        color:
          vigilanceColors[period.color_id]
      }))
    }))
}

export const getGlobalVigilance = (data) => {
  if (!data?.max_color_id) return null

  if (data.max_color_id <= 1) return null

  return vigilanceColors[data.max_color_id] || null
}
