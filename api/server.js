import express from 'express'
import rateLimit from 'express-rate-limit'
import dotenvx from '@dotenvx/dotenvx'

dotenvx.config({
  path: '.env.local'
})

const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 1)

const { API_KEY } = process.env

const limiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  max: 50,
  message: 'Too many requests, please try again later.',
})

app.get('/api/vigilance/:dep', limiter, async (req, res) => {
  try {
    const { dep } = req.params

    if (!/^\d{2,3}$/.test(dep)) {
      return res.status(400).json({ error: "Département invalide" })
    }

    const url = 'https://public-api.meteofrance.fr/public/DPVigilance/v1/cartevigilance/encours'
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      headers: { apikey: API_KEY },
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(await response.text())
    }

    const data = await response.json()

    const department = data?.product?.periods?.[0]?.timelaps?.domain_ids?.find(
      d => d.domain_id === dep
    )

    res.json(department || null)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(3001, () => console.log('API ok !'))
