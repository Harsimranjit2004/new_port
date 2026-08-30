import { StrictMode, type ReactNode } from 'react'
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
      panelContent={(
        <div className="global-orb-panel">
          <p>Move through the observatory or open a direct channel.</p>
          <nav aria-label="Orb shortcuts">
            <a href="/work">Projects ↗</a>
            <a href="/field-notes">Field Notes ↗</a>
            <a href="/about">About ↗</a>
            <a href="/contact">Contact ↗</a>
          </nav>
        </div>
      )}
    />}
  </StrictMode>,
)
