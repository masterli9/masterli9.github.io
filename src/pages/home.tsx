import React from 'react'

const home = () => {
  return (
    <>
      <section className='min-h-screen min-w-screen flex flex-row justify-center items-center bg-transparent'>
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-magenta-light rotate-45 opacity-70 glow-magenta-light"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 rounded-full border-2 border-gold-dark opacity-75 glow-gold-dark"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 border-2 border-magenta opacity-80 glow-magenta-light"></div>
        <div className="absolute top-10 right-32 w-16 h-28 border-2 border-cyan rounded-3xl opacity-60 glow-cyan rotate-12"></div>
        <div className="absolute bottom-14 left-36 w-28 h-12 border-2 border-gold-light rounded-lg opacity-70 glow-gold-light -rotate-6"></div>
        <div className="absolute top-1/2 left-1/3 w-20 h-20 border-4 border-magenta-dark rounded-full opacity-90 glow-magenta-dark"></div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <h1 className="text-glow-magenta">
              Andrej Zdvořák
            </h1>
            <p className="text-xl text-[var(--text-secondary)]">
              Web Developer & Mobile App Creator
            </p>
            <p className="text-lg text-[var(--text-secondary)] max-w-lg">
              I am a web developer who sometimes also makes mobile apps. I specialize in creating
              modern, performant applications with cutting-edge technologies.
            </p>

            {/* Social Links */}
            <div className="flex gap-4 pt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[var(--bg-secondary)] hover:bg-[var(--magenta)] transition-all duration-300 rounded-lg glow-magenta hover:scale-110"
              >
                {/* <Github className="w-6 h-6" /> */}
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[var(--bg-secondary)] hover:bg-[var(--gold)] hover:text-black transition-all duration-300 rounded-lg glow-gold hover:scale-110"
              >
                {/* <Linkedin className="w-6 h-6" /> */}
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[var(--bg-secondary)] hover:bg-[var(--magenta)] transition-all duration-300 rounded-lg glow-magenta hover:scale-110"
              >
                {/* <Twitter className="w-6 h-6" /> */}
              </a>
              <a
                href="mailto:andrej@example.com"
                className="p-3 bg-[var(--bg-secondary)] hover:bg-[var(--gold)] hover:text-black transition-all duration-300 rounded-lg glow-gold hover:scale-110"
              >
                {/* <Mail className="w-6 h-6" /> */}
              </a>
            </div>
          </div>
          <div className="space-y-6">
            <img src="https://static.vecteezy.com/system/resources/thumbnails/032/176/191/small/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg" alt="" />
          </div>
        </div>
      </section>
    </>
  )
}

export default home