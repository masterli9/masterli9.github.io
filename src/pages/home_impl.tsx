import Layout from '../components/Layout'
import Hero from '../components/Hero'
import Statement from '../components/Statement'
import SelectedWork from '../components/SelectedWork'
import About from '../components/About'
import Skills from '../components/Skills'
import Experience from '../components/Experience'
import Goals from '../components/Goals'
import ContactSection from '../components/ContactSection'
import { FactoryAct } from '../factory/FactoryAct'
import { FactoryFlowProvider } from '../factory/FactoryFlowProvider'

export default function HomeImpl() {
  return (
    <Layout>
      <FactoryFlowProvider>
        <FactoryAct id="upper">
          <Hero />
          <Statement />
          <SelectedWork />
        </FactoryAct>
        <About />
        <FactoryAct id="lower">
          <Skills />
          <Experience />
          <Goals />
          <ContactSection />
        </FactoryAct>
      </FactoryFlowProvider>
    </Layout>
  )
}
