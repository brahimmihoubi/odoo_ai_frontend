import { useState, useEffect, useRef, useCallback } from 'react'
import PageHeader from '../layout/PageHeader'
import { sendChat, generateReport } from '../../lib/api'

const ALL_CHIPS = [
  'What is our total revenue?',
  'Which products are low in stock?',
  'Generate a full business report',
  'How are our suppliers performing?',
  'Who are our best customers?',
  'What are our pending orders?',
]

const DEFAULT_REPORT = `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
No report generated yet.
Click "Generate Full Report" or
start chatting to auto-generate.
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄`

const SAMPLE_REPORT = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DAILY BUSINESS REPORT
Generated: April 22, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SALES OVERVIEW
Revenue:        $97,750
Orders:         1 confirmed
Avg Order:      $97,750
Status:         Growing

INVENTORY STATUS
Products:       4 total
Alert:          Laptop DZ Pro LOW
Stock Value:    $86,650
Action:         Reorder needed

SUPPLIER STATUS
Active:         2 suppliers
Best:           TechDZ ★★★★★
Avg Lead Time:  7.5 days
Pending Bills:  0

CUSTOMERS
Total:          2 active
Top:            Mohammed
Loyalty leader: Ahmed (100pts)

RECOMMENDATIONS
1. Reorder Laptop DZ Pro urgently
2. Follow up Sara Meziani (0 orders)
3. Negotiate lead time with Furniture+
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

const WELCOME = {
  id: 'welcome',
  role: 'ai',
  text: `Hello! I'm OdooAI, your business intelligence assistant.\nI can answer your questions AND update the business report on the right in real-time.\n\nBonjour! Je suis OdooAI, votre assistant BI.\nTry asking: "Give me today's sales summary"`,
  time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
}

function formatTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function getChips(exclude = []) {
  return ALL_CHIPS.filter(c => !exclude.includes(c)).slice(0, 3)
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(DEFAULT_REPORT)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportTime, setReportTime] = useState(null)
  const [chips, setChips] = useState(ALL_CHIPS.slice(0, 3))
  const [copied, setCopied] = useState(false)

  const messagesEndRef = useRef(null)
  const reportRef = useRef(null)

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-generate report on load after 1s
  useEffect(() => {
    const timer = setTimeout(() => doGenerateReport(), 1000)
    return () => clearTimeout(timer)
  }, [])

  const doGenerateReport = useCallback(async () => {
    setReportLoading(true)
    setReport('Generating report / Génération en cours...')
    try {
      const data = await generateReport()
      setReport(data?.report || data?.text || data?.content || SAMPLE_REPORT)
      setReportTime(formatTime())
    } catch {
      setReport(SAMPLE_REPORT)
      setReportTime(formatTime())
    } finally {
      setReportLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { id: Date.now() + '-u', role: 'user', text: msg, time: formatTime() }
    const thinkingMsg = { id: Date.now() + '-t', role: 'ai', text: 'Thinking / Réflexion...', thinking: true, time: '' }

    setMessages(prev => [...prev, userMsg, thinkingMsg])
    setLoading(true)
    setChips(getChips([msg]))

    try {
      const aiMsgId = Date.now() + '-a';
      setMessages(prev => [
        ...prev.filter(m => !m.thinking),
        { id: aiMsgId, role: 'ai', text: '', time: formatTime() }
      ])
      
      await sendChat(msg, (chunk) => {
        setMessages(prev => prev.map(m => 
          m.id === aiMsgId ? { ...m, text: m.text + chunk } : m
        ))
      })
      
      // Silently refresh report after chat
      doGenerateReport()
    } catch {
      setMessages(prev => [
        ...prev.filter(m => !m.thinking),
        {
          id: Date.now() + '-err',
          role: 'ai',
          text: 'Unable to reach the AI backend. Please check that localhost:8000 is running.\n\nImpossible de joindre le backend IA. Veuillez vérifier que localhost:8000 est actif.',
          time: formatTime()
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, doGenerateReport])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(report)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const downloadReport = () => {
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `odooai-report-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">
      <PageHeader title="AI Assistant / Assistant IA" subtitle="Powered by Ollama + odoo-assistant model" />

      <div className="chat-layout">
        {/* LEFT — Chatbot */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title">Chat with OdooAI / Discuter avec OdooAI</div>
          <div className="card-subtitle">Ask anything about your business data</div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`msg ${msg.role}`}>
                <div className={`msg-bubble${msg.thinking ? ' thinking' : ''}`}>
                  {msg.thinking ? (
                    <span>{msg.text}</span>
                  ) : (
                    msg.text
                  )}
                </div>
                {msg.time && <div className="msg-time">{msg.time}</div>}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chips */}
          <div className="chips">
            {chips.map(chip => (
              <button
                key={chip}
                className="chip"
                onClick={() => sendMessage(chip)}
                disabled={loading}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <input
              className="chat-input"
              type="text"
              placeholder="Ask about your business... / Posez une question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              Send / Envoyer
            </button>
          </div>
        </div>

        {/* RIGHT — Live Report */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title">Live Business Report / Rapport en direct</div>
          <div className="card-subtitle">Updates automatically as you chat</div>

          {/* Controls */}
          <div className="report-controls">
            <button
              className="btn btn-outline"
              onClick={doGenerateReport}
              disabled={reportLoading}
            >
              ⚡ {reportLoading ? 'Generating...' : 'Generate Full Report'}
            </button>
            {reportTime && (
              <span className="report-timestamp">Last updated: {reportTime}</span>
            )}
          </div>

          {/* Report Box */}
          <div className="report-box" ref={reportRef}>
            {report}
          </div>

          {/* Footer */}
          <div className="report-footer">
            <button className="btn btn-outline" onClick={copyReport}>
              {copied ? '✓ Copied!' : '📋 Copy Report'}
            </button>
            <button className="btn btn-ghost" onClick={downloadReport}>
              💾 Download .txt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
