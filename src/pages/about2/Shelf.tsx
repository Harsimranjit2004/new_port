import { useState, type CSSProperties } from 'react'
import { books, shelfGroups, type Book } from './shelf.data'

function Cover({ book, decorative = false }: { book: Book; decorative?: boolean }) {
  const [failed, setFailed] = useState(false)
  return <div className="a2-book-cover" style={{ background: book.color, color: book.ink ?? '#152a33' }}>{!failed && <img src={book.cover} alt={decorative ? '' : `Cover of ${book.title} by ${book.author}`} loading="lazy" onError={() => setFailed(true)} />}<div className="a2-book-fallback"><strong>{book.title}</strong><span>{book.author}</span></div></div>
}

function ShelfBook({ book }: { book: Book }) {
  return <figure className={`a2-shelf-book${book.status === 'reading' ? ' is-reading' : ''}`} style={{ '--book-height': `${book.height}px` } as CSSProperties} tabIndex={0}><Cover book={book} /><figcaption><strong>{book.title}</strong><span>{book.author}</span>{book.category && <small>{book.category}</small>}</figcaption>{book.status === 'reading' && <span className="a2-reading-marker"><i /> Reading</span>}</figure>
}

export default function Shelf({ items = books }: { items?: Book[] }) {
  const currentBook = items.find((book) => book.status === 'reading') ?? items[0] ?? books[0]
  return <section className="a2-shelf" aria-labelledby="a2-shelf-heading"><div className="a2-shell"><div className="a2-shelf__intro"><header><p className="a2-eyebrow">03 / The shelf</p><h2 id="a2-shelf-heading">Books that shape how I think<span>.</span></h2><p>Ideas from engineers, writers, and thinkers<br />I keep coming back to.</p></header><aside className="a2-current-book" aria-label="Currently reading"><p>Currently reading</p><div><div className="a2-current-book__cover"><Cover book={currentBook} decorative /></div><section><h3>{currentBook.title}</h3><strong>{currentBook.author}</strong><i /><p>{currentBook.note}</p></section></div></aside></div><div className="a2-shelf-installation">{shelfGroups.map((group) => <div className="a2-shelf-level" key={group.id}><div className="a2-shelf-level__books">{items.filter((book) => book.shelf === group.id).map((book) => <ShelfBook book={book} key={`${book.title}-${book.author}`} />)}</div><div className="a2-shelf-plank" aria-hidden="true" /></div>)}</div></div></section>
}
