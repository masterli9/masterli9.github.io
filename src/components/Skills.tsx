export default function Skills(){
  return (
    <section id="skills" className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold">Dovednosti</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="font-semibold">Odborné</h3>
            <ul className="mt-2 text-gray-300 text-sm">
              <li>React, TypeScript</li>
              <li>Vývoj mobilních aplikací</li>
              <li>Databáze a nasazení</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="font-semibold">Soft skills</h3>
            <ul className="mt-2 text-gray-300 text-sm">
              <li>Samostatné učení</li>
              <li>Analytické myšlení</li>
              <li>Týmová spolupráce</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="font-semibold">Jazyky</h3>
            <ul className="mt-2 text-gray-300 text-sm">
              <li>Čeština (C2)</li>
              <li>Angličtina (C1)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
