import { API_BASE } from './adminApi'

export interface PublicProjectMetric {
  value?: string | number
  label?: string
  [key: string]: unknown
}

export interface PublicProjectPipelineStep {
  label: string
  state?: string
}

export interface PublicProjectReadoutRow {
  k: string
  v: string
  note?: string
  w?: number
  hi?: boolean
}

export interface PublicProjectSection {
  id: string
  title: string
  body: string
}

export interface SocialLink {
  label: string
  url: string
}

export interface PublicProfile {
  name?: string
  role?: string
  location?: string
  email?: string
  headline?: string
  biography?: string
  resume_url?: string
  avatar_media_id?: string
  avatar_url?: string
  avatar_alt?: string
  social_links?: SocialLink[]
  working_set?: unknown
  currently?: unknown
  extra?: Record<string, unknown>
}

export interface SiteSetting { key: string; value: unknown }
export interface SitePageSection { section?: string; content?: Record<string, unknown>; enabled?: boolean; [key: string]: unknown }
export type SitePagePayload = SitePageSection[] | Record<string, unknown>
export interface ContactCreate { name: string; email: string; topic: string; message: string; website: '' }
export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export interface ChatSource { title: string; url: string; source_type: string; excerpt: string; score: number }
export interface ChatAction { label: string; url: string }
export interface ChatResponse { answer: string; sources: ChatSource[]; suggested_actions: ChatAction[] }
export type PublicFieldNote = Record<string, unknown> & { slug?: string; title?: string; excerpt?: string; summary?: string; published_at?: string; created_at?: string; note_type?: string; project?: string; read_time?: string | number; featured?: boolean }

export interface PublicProject {
  slug: string
  index_label?: string
  title: string
  domain?: string
  status?: string
  year?: string | number
  question?: string
  thesis?: string
  summary?: string
  featured?: boolean
  published?: boolean
  sort_order?: number
  cover_media_id?: string
  cover_url?: string
  cover_alt?: string
  metrics?: PublicProjectMetric[]
  pipeline?: PublicProjectPipelineStep[]
  trace?: {
    cmd?: string
    result?: string
    rows?: PublicProjectReadoutRow[]
  }
  sections?: PublicProjectSection[]
  links?: unknown
  technologies?: unknown
  extra?: unknown
}

async function publicRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body) headers.set('Content-Type', 'application/json')
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.detail || `Request failed (${response.status})`)
  return data as T
}

function unwrapProjects(payload: PublicProject[] | { results?: PublicProject[]; projects?: PublicProject[] }): PublicProject[] {
  if (Array.isArray(payload)) return payload
  return payload.results ?? payload.projects ?? []
}

export function settingsMap(settings: SiteSetting[]): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const { key, value } of settings) {
    result[key] = value
    const parts = key.split('.')
    const shortKey = parts.at(-1) ?? key
    result[shortKey] ??= value

    if (parts.length > 1) {
      const root = parts[0]
      const nested = result[root] && typeof result[root] === 'object' && !Array.isArray(result[root])
        ? result[root] as Record<string, unknown>
        : {}
      nested[parts.slice(1).join('_')] = value
      result[root] = nested
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const prefix = shortKey.replace(/[^a-z0-9]+/gi, '_')
      for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
        result[`${prefix}_${childKey}`] ??= childValue
      }
    }
  }
  return result
}

export function settingString(settings: Record<string, unknown>, keys: string[], fallback: string): string {
  for (const key of keys) {
    const value = settings[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return fallback
}

export const publicApi = {
  profile: () => publicRequest<PublicProfile>('/profile'),
  settings: () => publicRequest<SiteSetting[]>('/site/settings'),
  homePage: () => publicRequest<SitePageSection[] | Record<string, unknown>>('/site/pages/home'),
  contactPage: () => publicRequest<SitePagePayload>('/site/pages/contact'),
  aboutPage: () => publicRequest<SitePagePayload>('/site/pages/about'),
  contact: (body: ContactCreate) => publicRequest<unknown>('/contact', { method: 'POST', body: JSON.stringify(body) }),
  chat: (message: string, history: ChatMessage[]) => publicRequest<ChatResponse>('/ai/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),
  async fieldNotes(): Promise<PublicFieldNote[]> {
    const payload = await publicRequest<PublicFieldNote[] | { results?: PublicFieldNote[]; notes?: PublicFieldNote[] }>('/field-notes')
    return Array.isArray(payload) ? payload : payload.results ?? payload.notes ?? []
  },
  async projects(): Promise<PublicProject[]> {
    const payload = await publicRequest<PublicProject[] | { results?: PublicProject[]; projects?: PublicProject[] }>('/projects')
    return unwrapProjects(payload)
      .filter((project) => project.published !== false)
      .sort((a, b) => (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER))
  },
  project(slug: string): Promise<PublicProject> {
    return publicRequest<PublicProject>(`/projects/${encodeURIComponent(slug)}`)
  },
}
