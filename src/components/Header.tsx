export default function Header() {
  return (
    <header className="fixed w-full z-50 top-0">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-white font-semibold">Andrej Zdvořák</div>
        <nav className="hidden md:flex gap-6 text-sm text-gray-300">
          <a href="#about" className="hover:text-white transition">O mně</a>
          <a href="#skills" className="hover:text-white transition">Dovednosti</a>
          <a href="#projects" className="hover:text-white transition">Projekty</a>
          <a href="#experience" className="hover:text-white transition">Zkušenosti</a>
          <a href="#contact" className="hover:text-white transition">Kontakt</a>
        </nav>
        <div className="md:hidden text-white">☰</div>
      </div>
    </header>
  )
}
