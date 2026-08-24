import { Footer } from '../components/footer'
import { Navbar } from '../components/navbar'
import { OceanBackground } from '../components/ocean'
import ProjectRecordShowcase from './ProjectRecordShowcase'
import './WorkPage.css'

export default function WorkPage() {
  return (
    <main className="work-page">
      <Navbar submergedAt={0} />
      <OceanBackground
        screens={1}
        startDepth="shallow"
        endDepth="deep"
        showSurfaceWaves
        className="work-page__ocean"
      >
        <header className="work-page__intro">
          <div className="work-page__depth-markers" aria-hidden="true">
            <span>Surface</span>
            <i />
            <span>Selected systems</span>
          </div>
          <p>Engineering records · 2026</p>
          <div className="work-page__title-reveal">
            <h1>Work experience</h1>
          </div>
          <div className="work-page__intro-note">
            <span>03 projects</span>
            <p>Systems built around evidence, reproducibility, constraints, and decisions.</p>
          </div>
        </header>

        <ProjectRecordShowcase />
        <Footer />
      </OceanBackground>
    </main>
  )
}
