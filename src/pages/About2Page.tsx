import { Footer } from '../components/footer'
import { Navbar } from '../components/navbar'
import Observer from './about2/Observer'
import Work from './about2/Work'
import Shelf from './about2/Shelf'
import Outside from './about2/Outside'
import './about2/about2.css'

export default function About2Page() {
  return <div id="top" className="a2 white-surface"><Navbar submergedAt={Number.POSITIVE_INFINITY} /><main><Observer /><Work /><Shelf /><Outside /></main><Footer /></div>
}
