import { Footer } from './components/footer'
import { Navbar } from './components/navbar'
import { OceanBackground } from './components/ocean'
import ProjectRecordShowcase from './pages/ProjectRecordShowcase'
import './App.css'

export default function App() {
  return (
    <main id="top">
      <Navbar />
      <section className="white-surface" aria-labelledby="home-name">
        <div className="hero-type">
          <p className="hero-type__line">Engineering beneath the surface <span aria-hidden="true">—</span> ML / AI engineer</p>
          <h1 id="home-name">Harsimranjit</h1>
          <p className="hero-type__line hero-type__line--disciplines">
            <span>Machine learning</span>
            <span aria-hidden="true">—</span>
            <span>ML systems</span>
            <span aria-hidden="true">—</span>
            <span>Research &amp; experimentation</span>
          </p>
        </div>
      </section>
      <OceanBackground
        screens={5}
        startDepth="shallow"
        endDepth="deep"
        showSurfaceWaves
      >
        <p className="descent-statement">
          The result is only the surface.<br />
          The interesting part is<br />
          what made it possible.
        </p>
        <ProjectRecordShowcase />
        <Footer />
      </OceanBackground>
    </main>
  )
}
