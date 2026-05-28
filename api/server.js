import express from 'express'
import dotenvx from '@dotenvx/dotenvx'

dotenvx.config({
  path: '.env.local'
})

const app = express()

const { API_KEY } = process.env

let cache = {
  data: null,
  timestamp: 0
}

const CACHE_TTL = 10 * 60 * 1000

app.get('/api/vigilance/:dep', async (req, res) => {
  try {
    const { dep } = req.params

    const now = Date.now()

    if (!cache.data || now - cache.timestamp > CACHE_TTL) {
      const response = await fetch(
        'https://public-api.meteofrance.fr/public/DPVigilance/v1/cartevigilance/encours',
        {
          headers: {
            apikey: API_KEY
          }
        }
      )

      if (!response.ok) {
        throw new Error(await response.text())
      }

      cache.data = await response.json()
      cache.timestamp = now
    }

    const department = cache.data.product.periods[0].timelaps.domain_ids.find(
      d => d.domain_id === dep
    )

    res.json(department || null)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(3001, () => console.log('API ok !'))
