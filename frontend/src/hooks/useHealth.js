import { useState, useEffect } from 'react'
import { checkHealth } from '../lib/api'

export function useHealth() {
  const [backend, setBackend] = useState('checking')
  const [ollama, setOllama] = useState('checking')

  useEffect(() => {
    checkHealth()
      .then(data => {
        setBackend('ok')
        const isOk = data.ollama_status === 'ok' || data.ollama === true || data.status === 'ok'
        setOllama(isOk ? 'ok' : 'error')
      })
      .catch(() => {
        setBackend('error')
        setOllama('error')
      })
  }, [])

  return { backend, ollama, odoo: 'ok' }
}
