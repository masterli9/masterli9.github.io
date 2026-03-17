export default function About(){
  return (
    <section id="about" className="py-12">
      <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-2xl font-semibold">O mně</h2>
          <p className="mt-3 text-gray-300">Jsem student oboru Informační technologie na Střední průmyslové škole v Ústí nad Labem. Dlouhodobě se věnuji vývoji webových a mobilních aplikací a rád využívám umělou inteligenci k efektivnějšímu řešení problémů. Mám praxi v menších týmech a na projektech jako RehearsalHub a The GT Series.</p>
          <div className="mt-4 flex gap-2 flex-wrap text-sm text-gray-400">
            <span className="px-3 py-1 bg-gray-800 rounded-full">Pracovitost</span>
            <span className="px-3 py-1 bg-gray-800 rounded-full">Vytrvalost</span>
            <span className="px-3 py-1 bg-gray-800 rounded-full">Kreativita</span>
          </div>
        </div>
        <div>
          <div className="w-48 h-48 bg-gray-700 rounded-lg" aria-hidden="true">Placeholder</div>
        </div>
      </div>
    </section>
  )
}
