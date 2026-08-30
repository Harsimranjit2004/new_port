import { StrictMode, useState, type FormEvent, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { PortableWaterOrb } from './components/portable-water-orb'

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

const suggestedAnswers: Record<string, string> = {
  'What projects have you built?': 'Explore production-minded ML systems, recommendation work, evaluation tooling, and backend infrastructure in the Work archive.',
  'What are you working on?': 'Currently focused on ML/AI systems, recommendation systems, backend infrastructure, and reliable production workflows.',
  'How can I contact you?': 'Open the Contact page to start a conversation, or use the social links in the footer.',
}

function GlobalOrbChat() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([])
  const [input, setInput] = useState('')

  const ask = (question: string) => {
    const text = question.trim()
    if (!text) return
    setMessages((current) => [...current, { role: 'user', text }, { role: 'assistant', text: suggestedAnswers[text] ?? 'I can help you explore the portfolio. For a detailed answer, please start a conversation through the Contact page.' }])
    setInput('')
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    ask(input)
  }

  return <div className="global-orb-chat">
    <p>Ask about the work, experience, or how to get in touch.</p>
    {messages.length > 0 && <div className="global-orb-chat__messages" aria-live="polite">{messages.map((message, index) => <div className={`is-${message.role}`} key={`${message.role}-${index}`}>{message.text}</div>)}</div>}
    <div className="global-orb-chat__suggestions">{suggestedQuestions.map((question) => <button type="button" onClick={() => ask(question)} key={question}>{question}</button>)}</div>
    <form onSubmit={submit}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask h. something…" aria-label="Message" /><button type="submit" disabled={!input.trim()} aria-label="Send message">↗</button></form>
  </div>
}

const pages: Record<string, ReactNode> = {
  '/about': <About2Page />,
  '/about-2': <About2Page />,
  '/admin': <AdminPage />,
  '/contact': <ContactPage />,
  '/work': <WorkPage />,
  '/work/whetstone': <WhetstoneProjectPage />,
  '/work/moderation': <WhetstoneProjectPage />,
  '/work/recommendation-systems': <WhetstoneProjectPage />,
  '/work/evaluation-harness': <WhetstoneProjectPage />,
  '/work/retrieval-lab': <WhetstoneProjectPage />,
  '/work/drift-signals': <WhetstoneProjectPage />,
  '/work/tool-ledger': <WhetstoneProjectPage />,
  '/field-notes': <FieldNotesPage />,
  '/field-notes/tokenizer-native-backend': <FieldNotesDetailPage />,
}
const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
const page = pages[pathname] ?? <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {page}
    {pathname !== '/admin' && <PortableWaterOrb
      surfaceSelector=".white-surface"
      panelTitle="Ask beneath the surface."
      panelContent={<GlobalOrbChat />}
    />}
  </StrictMode>,
)
