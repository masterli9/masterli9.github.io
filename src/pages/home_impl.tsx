import Layout from '../components/Layout'
import About from '../components/About'
import Skills from '../components/Skills'
import Projects from '../components/Projects'
import Experience from '../components/Experience'

export default function HomeImpl(){
  return (
    <Layout>
      <section id="hero" className="min-h-[60vh] flex items-center">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-6xl font-bold">Andrej Zdvořák — student IT a tvůrce webových aplikací</h1>
          <p className="mt-4 text-gray-300">Vyvíjím webové a mobilní aplikace, které lidem zjednodušují a zefektivňují práci. (placeholder)</p>
          <div className="mt-6 flex gap-4">
            <a href="#contact" className="px-4 py-2 bg-cyan-400 text-black rounded-md">Kontaktujte mě</a>
            <a href="#projects" className="px-4 py-2 border border-gray-700 rounded-md text-gray-200">Projekty</a>
          </div>
        </div>
      </section>

      <About />

      <Skills />

      <Projects />

      <Experience />

      <section id="contact" className="py-12">
         <div className="max-w-4xl mx-auto px-4">
           <h2 className="text-2xl font-semibold">Kontakt</h2>
           <p className="mt-3 text-gray-300">andrej.zdvorak.123@gmail.com</p>
         </div>
      </section>
    </Layout>
  )
}
