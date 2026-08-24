import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import FieldNotesDetailPage from './pages/FieldNotesDetailPage'
import FieldNotesPage from './pages/FieldNotesPage'
import WhetstoneProjectPage from './pages/WhetstoneProjectPage'
import WorkPage from './pages/WorkPage'
import './index.css'

const pages: Record<string, ReactNode> = {
  '/about': <AboutPage />,
  '/contact': <ContactPage />,
  '/work': <WorkPage />,
  '/work/whetstone': <WhetstoneProjectPage />,
  '/field-notes': <FieldNotesPage />,
  '/field-notes/tokenizer-native-backend': <FieldNotesDetailPage />,
}
const page = pages[window.location.pathname] ?? <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {page}
  </StrictMode>,
)
