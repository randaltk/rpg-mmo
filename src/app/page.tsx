import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 animate-float"
            style={{
              width: `${2 + (i % 4) * 2}px`,
              height: `${2 + (i % 4) * 2}px`,
              left: `${(i * 2.5) % 100}%`,
              top: `${(i * 3.7) % 100}%`,
              backgroundColor: ['#9B30FF', '#00E5FF', '#FFD700', '#FF6B6B'][i % 4],
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${4 + (i % 5) * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-lg">
            R
          </div>
          <span className="text-xl font-bold tracking-wide">RPG MMO</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Recursos</a>
          <a href="#worlds" className="hover:text-white transition-colors">Mundos</a>
          <Link
            href="/play"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors font-medium text-white"
          >
            Jogar Agora
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Servidores online
        </div>

        <h1 className="text-5xl sm:text-7xl font-black leading-tight mb-6 max-w-4xl">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Explore Mundos
          </span>
          <br />
          <span className="text-white">Épicos no Navegador</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
          Um RPG MMO 3D completo direto no seu navegador. Explore castelos, cavernas
          cristalinas e vastas planícies. Jogue com amigos em tempo real.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/play"
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
          >
            <span className="relative z-10 flex items-center gap-2">
              Entrar no Jogo
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
          <a href="#features" className="px-8 py-4 border border-white/20 rounded-xl text-gray-300 hover:text-white hover:border-white/40 transition-all">
            Saiba Mais
          </a>
        </div>

        {/* Stats */}
        <div className="flex gap-12 mt-16 text-center">
          <div>
            <div className="text-3xl font-bold text-white">3</div>
            <div className="text-sm text-gray-500 mt-1">Mundos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">∞</div>
            <div className="text-sm text-gray-500 mt-1">Aventuras</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">0</div>
            <div className="text-sm text-gray-500 mt-1">Downloads</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-8 py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Recursos do Jogo</h2>
        <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
          Tudo que você precisa para uma experiência RPG completa, direto no navegador.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🏰',
              title: 'Salão do Castelo',
              desc: 'Comece sua jornada no grande salão real. Tochas iluminam os corredores de pedra enquanto portais mágicos aguardam.',
              gradient: 'from-amber-500/20 to-orange-500/20',
              border: 'border-amber-500/20',
            },
            {
              icon: '💎',
              title: 'Caverna Cristalina',
              desc: 'Explore profundezas misteriosas iluminadas por cristais bioluminescentes. Tesouros ancestrais esperam os mais corajosos.',
              gradient: 'from-purple-500/20 to-blue-500/20',
              border: 'border-purple-500/20',
            },
            {
              icon: '⛰️',
              title: 'Planícies de Aldoria',
              desc: 'Vastas planícies com montanhas no horizonte. Florestas, rochas e caminhos se estendem até onde a vista alcança.',
              gradient: 'from-green-500/20 to-emerald-500/20',
              border: 'border-green-500/20',
            },
            {
              icon: '⚔️',
              title: 'Sistema de Equipamentos',
              desc: 'Encontre armas, armaduras e acessórios. Equipe itens para aumentar seus atributos de ataque e defesa.',
              gradient: 'from-red-500/20 to-pink-500/20',
              border: 'border-red-500/20',
            },
            {
              icon: '👥',
              title: 'Multiplayer em Tempo Real',
              desc: 'Jogue com amigos em tempo real. Veja outros jogadores se movendo, converse pelo chat integrado.',
              gradient: 'from-cyan-500/20 to-teal-500/20',
              border: 'border-cyan-500/20',
            },
            {
              icon: '🗺️',
              title: 'Portais Mágicos',
              desc: 'Viaje instantaneamente entre mundos através de portais místicos. Cada mundo tem uma atmosfera única.',
              gradient: 'from-violet-500/20 to-fuchsia-500/20',
              border: 'border-violet-500/20',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${feature.gradient} border ${feature.border} backdrop-blur-sm hover:scale-[1.02] transition-transform`}
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Worlds Section */}
      <section id="worlds" className="relative z-10 px-8 py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Três Mundos para Explorar</h2>
        <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
          Cada mapa tem sua própria atmosfera, NPCs e desafios únicos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Salão do Castelo', type: 'Spawn', color: 'from-amber-600 to-orange-800', items: ['Trono Real', '2 Portais', 'Tochas', 'Guardas Reais'] },
            { name: 'Caverna Cristalina', type: 'Exploração', color: 'from-purple-600 to-indigo-900', items: ['Cristais Mágicos', 'Estalagmites', 'Ferreiro', 'Tesouros'] },
            { name: 'Planícies de Aldoria', type: 'Mundo Aberto', color: 'from-green-600 to-emerald-900', items: ['Montanhas', '60+ Árvores', 'NPCs', 'Caminhos'] },
          ].map((world, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-colors">
              <div className={`h-40 bg-gradient-to-br ${world.color} flex items-center justify-center`}>
                <span className="text-4xl font-bold opacity-30">{world.type}</span>
              </div>
              <div className="p-6 bg-white/5">
                <h3 className="text-lg font-bold mb-3">{world.name}</h3>
                <ul className="space-y-2">
                  {world.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-8 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Pronto para a Aventura?</h2>
          <p className="text-gray-400 mb-8">
            Nenhum download necessário. Basta escolher um nickname e começar a jogar.
          </p>
          <Link
            href="/play"
            className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
          >
            Jogar Agora
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-8 py-8 text-center text-sm text-gray-500">
        <p>RPG MMO 3D - Jogo desenvolvido com Next.js, Three.js e Socket.io</p>
      </footer>
    </div>
  );
}
