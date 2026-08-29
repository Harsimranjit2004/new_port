export type Book = {
  title: string
  author: string
  cover: string
  shelf: 'current' | 'read' | 'return'
  status?: 'reading'
  note?: string
  category?: string
  height: number
  color: string
  ink?: string
}

const cover = (isbn: string) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`

export const books: Book[] = [
  { title: 'L’Étranger', author: 'Albert Camus', cover: cover('9782070360024'), shelf: 'current', status: 'reading', note: 'Part novel. Part French lesson.', category: 'Literary fiction', height: 214, color: '#eee9df' },
  { title: 'Atomic Habits', author: 'James Clear', cover: cover('9780735211292'), shelf: 'current', category: 'Habits · Psychology', height: 202, color: '#f2eee5' },
  { title: 'The Almanack of Naval Ravikant', author: 'Eric Jorgenson', cover: cover('9781544514215'), shelf: 'current', category: 'Ideas · Life', height: 190, color: '#eee9df' },
  { title: 'The Design of Everyday Things', author: 'Don Norman', cover: cover('9780465050659'), shelf: 'current', category: 'Design', height: 204, color: '#e4b231' },
  { title: 'Poor Charlie’s Almanack', author: 'Charles T. Munger', cover: cover('9781578645015'), shelf: 'current', category: 'Mental models', height: 210, color: '#183249', ink: '#f5e5bb' },
  { title: 'The Pragmatic Programmer', author: 'David Thomas & Andrew Hunt', cover: cover('9780135957059'), shelf: 'current', category: 'Software engineering', height: 198, color: '#202321', ink: '#f3f0df' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', cover: cover('9780062316097'), shelf: 'current', category: 'History · Ideas', height: 207, color: '#eee6d9' },

  { title: 'Deep Work', author: 'Cal Newport', cover: cover('9781455586691'), shelf: 'read', category: 'Focus', height: 194, color: '#e9c33d' },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', cover: cover('9781449373320'), shelf: 'read', category: 'Systems', height: 211, color: '#eee7dc' },
  { title: 'Clean Code', author: 'Robert C. Martin', cover: cover('9780132350884'), shelf: 'read', category: 'Software engineering', height: 188, color: '#161b20', ink: '#fff' },
  { title: 'The Psychology of Money', author: 'Morgan Housel', cover: cover('9780857197689'), shelf: 'read', category: 'Psychology · Money', height: 205, color: '#f0ede5' },
  { title: 'Range', author: 'David Epstein', cover: cover('9780735214484'), shelf: 'read', category: 'Learning · Generalists', height: 198, color: '#9ecfc4' },
  { title: 'The Obstacle Is the Way', author: 'Ryan Holiday', cover: cover('9781591846352'), shelf: 'read', category: 'Stoicism', height: 208, color: '#eee8dc' },
  { title: 'Hooked', author: 'Nir Eyal', cover: cover('9781591847786'), shelf: 'read', category: 'Product · Psychology', height: 180, color: '#e5bc2c' },

  { title: 'Zero to One', author: 'Peter Thiel', cover: cover('9780804139298'), shelf: 'return', category: 'Startups · Ideas', height: 206, color: '#a9c7df' },
  { title: 'Made to Stick', author: 'Chip Heath & Dan Heath', cover: cover('9781400064281'), shelf: 'return', category: 'Communication', height: 188, color: '#df6031', ink: '#fff' },
  { title: 'The Lean Startup', author: 'Eric Ries', cover: cover('9780307887894'), shelf: 'return', category: 'Startups', height: 201, color: '#2876a8', ink: '#fff' },
  { title: 'Creativity, Inc.', author: 'Ed Catmull', cover: cover('9780812993011'), shelf: 'return', category: 'Creativity · Teams', height: 214, color: '#9c292b', ink: '#fff' },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', cover: cover('9780374533557'), shelf: 'return', category: 'Psychology · Decisions', height: 196, color: '#f2efe8' },
]

export const shelfGroups = [
  { id: 'current' as const, label: 'Current / recent' },
  { id: 'read' as const, label: 'Read / notes' },
  { id: 'return' as const, label: 'Return to / interests' },
]
