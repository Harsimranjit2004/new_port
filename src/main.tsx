import { StrictMode, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { PortableWaterOrb } from './components/portable-water-orb'
import { publicApi, settingString, settingsMap, type ChatMessage } from './lib/publicApi'

import About2Page from './pages/About2Page'
import AdminPage from './pages/AdminPage'
import ContactPage from './pages/ContactPage'
import FieldNotesDetailPage from './pages/FieldNotesDetailPage'
import FieldNotesPage from './pages/FieldNotesPage'
import WhetstoneProjectPage from './pages/WhetstoneProjectPage'
import WorkPage from './pages/WorkPage'
import './index.css'

const suggestedQuestions = [
  'What projects have you built?',
  'What are you working on?',
  'How can I contact you?',
]


function GlobalOrbChat() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; sources?: Array<{ title: string; url: string; source_type: string; citationNumber: number }>; actions?: Array<{ label: string; url: string }> }>>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, busy])

  const ask = async (question: string) => {
    const text = question.trim()
    if (!text || busy) return
    const history: ChatMessage[] = messages.map((message) => ({ role: message.role, content: message.text }))
    setMessages((current) => [...current, { role: 'user', text }])
    setInput('')
    setBusy(true)
    setError('')
    try {
      const response = await publicApi.chat(text, history)
      const citedNumbers = new Set(Array.from(response.answer.matchAll(/\[(\d+)\]/g), (match) => Number(match[1]) - 1))
      const citedSources = response.sources.flatMap((source, index) => citedNumbers.has(index) ? [{ ...source, citationNumber: index + 1 }] : [])
      setMessages((current) => [...current, {
        role: 'assistant',
        text: response.answer,
        sources: citedSources,
        actions: citedSources.length ? response.suggested_actions : [],
      }])
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The assistant is unavailable right now.')
    } finally {
      setBusy(false)
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void ask(input)
  }

  return <div className="global-orb-chat">
    <p>Ask about the work, experience, or how to get in touch.</p>
    {messages.length > 0 && <div className="global-orb-chat__messages" aria-live="polite">{messages.map((message, index) => <div className={`is-${message.role}`} key={`${message.role}-${index}`}><span>{message.text}</span>{message.sources?.length ? <div className="global-orb-chat__sources"><small>Sources</small>{message.sources.map((source, sourceIndex) => <a href={source.url} target={source.url.startsWith('http') ? '_blank' : undefined} rel={source.url.startsWith('http') ? 'noreferrer' : undefined} key={`${source.url}-${sourceIndex}`}>[{source.citationNumber}] {source.title}<i>{source.source_type.replace('_', ' ')}</i></a>)}</div> : null}{message.actions?.length ? <div className="global-orb-chat__actions">{message.actions.map((action) => <a href={action.url} target={action.url.startsWith('http') ? '_blank' : undefined} rel={action.url.startsWith('http') ? 'noreferrer' : undefined} key={`${action.url}-${action.label}`}>{action.label} →</a>)}</div> : null}</div>)}{busy && <div className="is-assistant is-pending">Thinking…</div>}<div ref={endRef} /></div>}
    {error && <p className="global-orb-chat__error" role="alert">{error}</p>}
    {messages.length === 0 && <div className="global-orb-chat__suggestions">{suggestedQuestions.map((question) => <button type="button" disabled={busy} onClick={() => void ask(question)} key={question}>{question}</button>)}</div>}
    <form onSubmit={submit}><input value={input} disabled={busy} onChange={(event) => setInput(event.target.value)} placeholder="Ask h. something…" aria-label="Message" /><button type="submit" disabled={busy || !input.trim()} aria-label="Send message">↗</button></form>
  </div>
}

function GlobalOrb() {
  const [settings, setSettings] = useState<Record<string, unknown>>({})
  useEffect(() => {
    let active = true
    publicApi.settings().then((value) => { if (active) setSettings(settingsMap(value)) }).catch(() => undefined)
    return () => { active = false }
  }, [])
  const configuredSize = Number(settings.orb_size)
  return <PortableWaterOrb
    size={Number.isFinite(configuredSize) && configuredSize >= 56 && configuredSize <= 160 ? configuredSize : 90}
    label={settingString(settings, ['orb_label'], 'Ask h.')}
    ariaLabel={settingString(settings, ['orb_aria_label'], 'Open portfolio assistant')}
    surfaceSelector=".white-surface"
    panelTitle={settingString(settings, ['orb_title', 'orb_panel_title'], 'Ask beneath the surface.')}
    panelContent={<GlobalOrbChat />}
  />
}

const pages: Record<string, ReactNode> = {
  '/about': <About2Page />,
  '/about-2': <About2Page />,
  '/admin': <AdminPage />,
  '/contact': <ContactPage />,
  '/work': <WorkPage />,

  '/field-notes': <FieldNotesPage />,
  '/field-notes/tokenizer-native-backend': <FieldNotesDetailPage />,
}
const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
const page = pages[pathname]
  ?? (pathname.startsWith('/work/') ? <WhetstoneProjectPage />
    : pathname.startsWith('/field-notes/') ? <FieldNotesDetailPage />
      : <App />)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {page}
    {pathname !== '/admin' && <GlobalOrb />}
  </StrictMode>,
)
