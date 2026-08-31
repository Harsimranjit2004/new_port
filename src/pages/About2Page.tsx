import { useEffect, useState } from 'react'
import { Footer } from '../components/footer'
import { Navbar } from '../components/navbar'
import { publicApi, type PublicProfile, type SitePagePayload } from '../lib/publicApi'
import Observer, { type ObserverLink } from './about2/Observer'
import Work from './about2/Work'
import Shelf from './about2/Shelf'
import Outside from './about2/Outside'
import { experience, intro, technologies, workDomains } from './about2/about2.data'
import { books, type Book } from './about2/shelf.data'
import { lifeImages, type LifeImage } from './about2/life.data'
import './about2/about2.css'

type RecordValue = Record<string, unknown>
type AboutData = { profile: PublicProfile; page: SitePagePayload }

const isRecord = (value: unknown): value is RecordValue => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const text = (value: unknown): string | undefined => typeof value === 'string' && value.trim() ? value.trim() : undefined
const records = (value: unknown): RecordValue[] => Array.isArray(value) ? value.filter(isRecord) : []
const strings = (value: unknown): string[] => Array.isArray(value) ? value.map((item) => text(item) ?? (isRecord(item) ? text(item.name) ?? text(item.label) ?? text(item.title) : undefined)).filter((item): item is string => Boolean(item)) : []

function sectionContent(payload: SitePagePayload | undefined, section: string): RecordValue {
  if (!payload) return {}
  if (Array.isArray(payload)) return payload.find((item) => item.section === section && item.enabled !== false)?.content ?? {}
  const direct = payload[section]
  if (isRecord(direct)) return isRecord(direct.content) ? direct.content : direct
  const nested = payload.sections
  return Array.isArray(nested) ? sectionContent(nested as SitePagePayload, section) : {}
}

function valueFrom(source: unknown, keys: string[]): unknown {
  if (!isRecord(source)) return source
  for (const key of keys) if (source[key] !== undefined) return source[key]
  return undefined
}

function toExperience(value: unknown): typeof experience | undefined {
  const items = records(value).map((item) => ({
    period: text(item.period) ?? text(item.dates) ?? '',
    role: text(item.role) ?? text(item.title) ?? '',
    company: text(item.company) ?? text(item.organization) ?? '',
    description: text(item.description) ?? text(item.summary) ?? '',
    placeholder: item.placeholder === true,
  })).filter((item) => item.role)
  return items.length ? items : undefined
}

function toDomains(value: unknown): typeof workDomains | undefined {
  const items = strings(value).map((name, index) => ({ name, trace: (['long', 'medium', 'short'] as const)[index % 3] }))
  return items.length ? items : undefined
}

function toBooks(value: unknown): Book[] | undefined {
  const shelves: Book['shelf'][] = ['current', 'read', 'return']
  const items = records(value).map((item, index): Book | undefined => {
    const title = text(item.title)
    if (!title) return undefined
    const shelfValue = text(item.shelf) as Book['shelf'] | undefined
    return {
      title,
      author: text(item.author) ?? 'Unknown author',
      cover: text(item.cover) ?? text(item.cover_url) ?? '',
      shelf: shelfValue && shelves.includes(shelfValue) ? shelfValue : shelves[Math.min(Math.floor(index / 7), 2)],
      status: item.status === 'reading' || item.current === true ? 'reading' : undefined,
      note: text(item.note),
      category: text(item.category),
      height: typeof item.height === 'number' ? item.height : 190 + (index % 5) * 5,
      color: text(item.color) ?? '#eee9df',
      ink: text(item.ink),
    }
  }).filter((item): item is Book => Boolean(item))
  if (!items.length) return undefined
  if (!items.some((item) => item.status === 'reading')) items[0].status = 'reading'
  return items
}

function toLifeImages(value: unknown): LifeImage[] | undefined {
  const sizes: LifeImage['size'][] = ['large', 'wide', 'tall', 'medium', 'small']
  const items = records(value).map((item, index): LifeImage | undefined => {
    const src = text(item.src) ?? text(item.url)
    if (!src) return undefined
    const sizeValue = text(item.size) as LifeImage['size'] | undefined
    return { src, alt: text(item.alt) ?? 'A moment from life outside the screen', size: sizeValue && sizes.includes(sizeValue) ? sizeValue : sizes[index % sizes.length], caption: text(item.caption) }
  }).filter((item): item is LifeImage => Boolean(item))
  return items.length ? items : undefined
}

export default function About2Page() {
  const [data, setData] = useState<AboutData>()

  useEffect(() => {
    let active = true
    Promise.all([publicApi.profile(), publicApi.aboutPage()])
      .then(([profile, page]) => { if (active) setData({ profile, page }) })
      .catch(() => { /* Local content remains visible when the public API is unavailable. */ })
    return () => { active = false }
  }, [])

  const profile = data?.profile
  const introContent = sectionContent(data?.page, 'intro')
  const ways = sectionContent(data?.page, 'ways_of_working')
  const extra = profile?.extra ?? {}

  const statement = text(introContent.statement) ?? profile?.headline
  const paragraphs = [statement, profile?.biography].map(text).filter((item): item is string => Boolean(item))
  const dynamicLinks: ObserverLink[] = profile?.social_links?.filter((link) => text(link.label) && text(link.url)).map((link, index) => ({ label: link.label, href: link.url, primary: index === 0 })) ?? []

  const workingSet = profile?.working_set ?? ways.working_set ?? ways.domains
  const currently = profile?.currently ?? ways.currently ?? ways.technologies
  const experienceItems = toExperience(valueFrom(extra.experience ?? ways.experience, ['experience', 'items'])) ?? experience
  const domains = toDomains(valueFrom(workingSet, ['domains', 'items', 'working_set'])) ?? workDomains
  const technologyItems = strings(valueFrom(currently, ['technologies', 'tools', 'items', 'currently']))
  const shelfItems = toBooks(extra.books) ?? books
  const outsideImages = toLifeImages(extra.lifeImages ?? extra.life_images) ?? lifeImages

  return <div id="top" className="a2 white-surface"><Navbar submergedAt={Number.POSITIVE_INFINITY} /><main><Observer name={profile?.name ?? text(introContent.title) ?? intro.name} observer={text(introContent.observer)} paragraphs={paragraphs.length ? paragraphs : intro.paragraphs} links={dynamicLinks.length ? dynamicLinks : intro.links} /><Work experienceItems={experienceItems} domains={domains} technologyItems={technologyItems.length ? technologyItems : technologies} /><Shelf items={shelfItems} /><Outside images={outsideImages} /></main><Footer /></div>
}
