<script setup>
import { computed } from 'vue'

const props = defineProps({
  minutely: {
    type: Array,
    required: true
  }
})

const getColorForPrecipitation = (precipitation) => {
  if (precipitation > 1) return 'high'
  if (precipitation > 0) return 'low'
  return 'transparent'
}

const sections = computed(() =>
  props.minutely.map((item, index) => ({
    id: index,
    color: getColorForPrecipitation(item.precipitation),
    precipitation: Number(item.precipitation.toFixed(2))
  }))
)

const averagePrecipitation = computed(() => {
  if (!sections.value.length) return 0
  const total = sections.value.reduce((acc, i) => acc + i.precipitation, 0)
  return (total / sections.value.length).toFixed(2)
})

const hasRain = computed(() =>
  sections.value.some(s => s.color !== 'transparent')
)
</script>

<template>
  <div v-if="!hasRain">
    <p class="align-center small">
      Pas de précipitation à venir sur 4h
    </p>
  </div>
  <div v-else>
    <p class="align-center small">
      Précipitations à venir sur 4h (moy {{ averagePrecipitation }} mm)
    </p>
    <div class="rain-gauge">
      <div v-for="item in sections" :key="item.id" :class="['gauge-section', item.color]" />
    </div>
    <div class="gauge-labels">
      <div class="gauge-label">+0h</div>
      <div class="gauge-label">+2h</div>
      <div class="gauge-label">+4h</div>
    </div>
  </div>
</template>
