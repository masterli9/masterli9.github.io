export default function Projects(){
  return (
    <section id="projects" className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold">Projekty</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="p-6 bg-gray-800 rounded-lg">
            <h3 className="font-semibold">RehearsalHub</h3>
            <p className="text-gray-300 mt-2">RehearsalHub: aplikace pro organizaci zkoušek a sdílení materiálů pro menší kapely; školní projekt se zaměřením na uživatelskou správu a plánování.</p>
          </article>
          <article className="p-6 bg-gray-800 rounded-lg">
            <h3 className="font-semibold">The GT Series</h3>
            <p className="text-gray-300 mt-2">The GT Series: web pro správu a prezentaci ligy ve hře Forza Horizon 5; obsahuje rozpis závodů, výsledky a přehled jezdců.</p>
          </article>
        </div>
      </div>
    </section>
  )
}
