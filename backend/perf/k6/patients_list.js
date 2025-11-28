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

const searchTerms = ['juan', 'maria', 'ana', 'luis', 'choque']
const allergies = ['penicilina', 'polen']
const conditions = ['diabetes', 'hipertension']

export default function () {
  const params = []
  if (__ITER % 2 === 0) {
    const q = searchTerms[Math.floor(Math.random() * searchTerms.length)]
    params.push(`search=${q}`)
  }
  if (__ITER % 3 === 0) {
    const a = allergies[Math.floor(Math.random() * allergies.length)]
    params.push(`allergy=${encodeURIComponent(a)}`)
  }
  if (__ITER % 4 === 0) {
    const c = conditions[Math.floor(Math.random() * conditions.length)]
    params.push(`medical_condition=${encodeURIComponent(c)}`)
  }

  const url = `${BASE_URL}/patients/?${params.join('&')}`
  const res = http.get(url, { headers: HEADERS })

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has results or empty array': (r) => r.body && r.body.length >= 0,
  })

  sleep(0.5)
}

