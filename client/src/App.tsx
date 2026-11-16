import { About } from './components/About';
import { Experience } from './components/Experience';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Intro } from './components/Intro';
import { Marquee } from './components/Marquee';
import { MobileActionBar } from './components/MobileActionBar';
import { Projects } from './components/Projects';
import { useScreenFit } from './hooks/useScreenFit';
import { useScrollFx } from './hooks/useScrollFx';

export function App() {
  useScrollFx();
  useScreenFit();

  return (
    <>
      <Intro />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Projects />
        <Marquee lines={['Build it  ·  Break it  ·  Learn why  ·  ', 'Recon  ·  Parse  ·  Detect  ·  Harden  ·  ']} />
        <Experience />
        <About />
      </main>
      <Footer />
      <MobileActionBar />
    </>
  );
}

export default App;
