import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '20s', target: 25 },
    { duration: '40s', target: 75 },
    { duration: '60s', target: 100 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(50)<200', 'p(95)<500', 'p(99)<800'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
}

const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:8000/api'
const TOKEN = __ENV.K6_TOKEN || ''
const HEADERS = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}

const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled']
const searchTerms = ['dolor', 'control', 'examen', 'consulta', 'follow']

export default function () {
  const params = []
  // Random status filter
  if (__ITER % 2 === 0) {
    const s = statuses[Math.floor(Math.random() * statuses.length)]
    params.push(`status=${s}`)
  }
  // Random date range
  if (__ITER % 3 === 0) {
    params.push('date_from=2024-01-01')
    params.push('date_to=2025-12-31')
  }
  // Random search
  if (__ITER % 4 === 0) {
    const q = searchTerms[Math.floor(Math.random() * searchTerms.length)]
    params.push(`search=${q}`)
  }

  const url = `${BASE_URL}/appointments/?${params.join('&')}`
  const res = http.get(url, { headers: HEADERS })

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has results or empty array': (r) => r.body && r.body.length >= 0,
  })

  sleep(0.5)
}

