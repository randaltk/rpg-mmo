import Link from "next/link";
import Image from "next/image";

const FEATURES = [
  {
    icon: "⚔️",
    title: "Escolha Sua Classe",
    desc: "Selecione entre 8 classes únicas, cada uma com habilidades, armaduras e estilos de jogo distintos.",
  },
  {
    icon: "🌍",
    title: "Explore o Mundo",
    desc: "Descubra vastas terras, masmorras épicas e tesouros escondidos em 3 mapas imensos.",
  },
  {
    icon: "⚔️",
    title: "Entre em Batalha",
    desc: "Forme grupo com amigos e enfrente inimigos poderosos em combate em tempo real.",
  },
  {
    icon: "🏰",
    title: "Salão do Castelo",
    desc: "Comece sua jornada no grande salão real com tochas e portais mágicos aguardando exploração.",
  },
  {
    icon: "💎",
    title: "Caverna Cristalina",
    desc: "Explore profundezas iluminadas por cristais bioluminescentes com tesouros ancestrais.",
  },
  {
    icon: "🗺️",
    title: "Portais Mágicos",
    desc: "Viaje instantaneamente entre mundos através de portais místicos com atmosferas únicas.",
  },
];

const CLASSES = [
  {
    name: "Knight",
    weapon: "Espada + Escudo",
    img: "/rpg-assets/knight_aldoria.png",
  },
  {
    name: "Wizard",
    weapon: "Cajado + Magia",
    img: "/rpg-assets/wizard_aldoria.png",
  },
  {
    name: "Ranger",
    weapon: "Arco + Precisão",
    img: "/rpg-assets/ranger_aldoria.png",
  },
  {
    name: "Assassin",
    weapon: "Katares + Sigilo",
    img: "/rpg-assets/assassin_aldoria.png",
  },
  {
    name: "Paladin",
    weapon: "Espada Sagrada",
    img: "/rpg-assets/paladin_aldoria.png",
  },
  {
    name: "Rogue",
    weapon: "Adaga + Agilidade",
    img: "/rpg-assets/rogue_aldoria.png",
  },
  {
    name: "Sorcerer",
    weapon: "Cajado + Livro",
    img: "/rpg-assets/wizard_aldoria.png",
  },
  {
    name: "Priest",
    weapon: "Cajado + Cura",
    img: "/rpg-assets/paladin_aldoria.png",
  },
];

const WORLDS = [
  {
    name: "Salão do Castelo",
    type: "Spawn / Tutorial",
    icon: "🏰",
    items: [
      "Trono Real",
      "2 Portais Mágicos",
      "Tochas Iluminadas",
      "Guardas Reais",
    ],
  },
  {
    name: "Caverna Cristalina",
    type: "Exploração",
    icon: "💎",
    items: [
      "Cristais Mágicos",
      "Estalagmites",
      "Ferreiro",
      "Tesouros Escondidos",
    ],
  },
  {
    name: "Planícies de Aldoria",
    type: "Mundo Aberto",
    icon: "⛰️",
    items: [
      "Montanhas Gigantes",
      "60+ Árvores",
      "NPCs Diversos",
      "Caminhos Exploráveis",
    ],
  },
];

const NEWS = [
  {
    icon: "🐉",
    title: "Novo Evento: A Toca do Dragão",
    date: "21 de Fevereiro de 2026",
    desc: "Prepare-se para o maior desafio! Um dragão antigo despertou nas profundezas. Reúna sua guilda e enfrente este inimigo épico para recompensas lendárias.",
  },
  {
    icon: "✨",
    title: "Atualização 2.0 - Novas Habilidades",
    date: "15 de Fevereiro de 2026",
    desc: "Todas as classes receberam novas habilidades e melhorias no sistema de combate. Confira as notas completas!",
  },
  {
    icon: "🎁",
    title: "Promoção de Boas-vindas",
    date: "10 de Fevereiro de 2026",
    desc: "Novos jogadores recebem 1000 moedas de ouro, poções de vida e um item raro exclusivo.",
  },
  {
    icon: "🏆",
    title: "Torneio PvP - Fevereiro",
    date: "5 de Fevereiro de 2026",
    desc: "Participe do torneio PvP mensal e compita por títulos exclusivos e equipamentos lendários.",
  },
];

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-3">
      <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
      <div className="w-2.5 h-2.5 rotate-45 bg-[#D4AF37]/80" />
      <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0E27] text-white overflow-hidden relative">
      {/* Magical particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${2 + (i % 4) * 1.5}px`,
              height: `${2 + (i % 4) * 1.5}px`,
              left: `${(i * 2.5) % 100}%`,
              top: `${(i * 3.7) % 100}%`,
              backgroundColor: ["#D4AF37", "#7B3FF2", "#FFD700", "#4A8FD8"][
                i % 4
              ],
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${5 + (i % 6) * 2}s`,
              opacity: 0.15,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-2 bg-[#1A3A52]/95 border-b-2 border-[#D4AF37] backdrop-blur-md sticky top-0 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
        <div className="flex items-center gap-2">
          <Image
            src="/rpg-assets/logo_aldoria.png"
            alt="Legends of Aldoria"
            width={1000}
            height={800}
            className="h-14 w-auto"
            priority
          />
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: "#features", label: "Recursos" },
            { href: "#classes", label: "Classes" },
            { href: "#worlds", label: "Mundos" },
            { href: "#news", label: "Notícias" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-white/80 hover:text-[#D4AF37] transition-colors font-medium text-sm relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
            </a>
          ))}
        </div>
        <Link
          href="/play"
          className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] border border-[#D4AF37] text-[#0A0E27] font-cinzel font-bold text-sm rounded tracking-wide hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 transition-all uppercase"
        >
          Entrar
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[650px] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="absolute inset-0">
          <Image
            src="/rpg-assets/landing_bg.png"
            alt="Fantasy landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27]/60 via-[#0A0E27]/40 to-[#0A0E27]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(212,175,55,0.08)_0%,transparent_60%)]" />
        </div>

        <div className="relative z-10 max-w-5xl flex flex-col items-center">
          {/* Hero characters flanking logo */}
          <div className="flex items-center justify-center gap-4 md:gap-8 mb-6">
            <div className="hidden md:block w-36 lg:w-44 -mr-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <Image
                src="/rpg-assets/wizard_aldoria.png"
                alt="Wizard"
                width={200}
                height={200}
                className="w-full h-auto scale-x-[-1]"
              />
            </div>

            <div className="flex flex-col items-center">
              <Image
                src="/rpg-assets/logo_aldoria.png"
                alt="Legends of Aldoria"
                width={550}
                height={220}
                className="w-[300px] sm:w-[400px] lg:w-[500px] h-auto drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                priority
              />
            </div>

            <div className="hidden md:block w-36 lg:w-44 -ml-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <Image
                src="/rpg-assets/knight_aldoria.png"
                alt="Knight"
                width={200}
                height={200}
                className="w-full h-auto"
              />
            </div>
          </div>

          <h2 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
            Embarque em uma Aventura Épica!
          </h2>
          <p className="text-base sm:text-lg text-white/80 max-w-2xl mb-8 leading-relaxed">
            Junte-se a milhares de jogadores em um RPG MMO 3D fantástico direto
            no seu navegador!
          </p>

          {/* Play button */}
          <Link
            href="/play"
            className="group relative px-12 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] border-2 border-[#FFD700] text-[#0A0E27] font-cinzel font-black text-xl rounded-lg tracking-widest hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] hover:-translate-y-1 transition-all uppercase animate-border-glow"
          >
            <span className="flex items-center gap-3">
              Jogar Agora
              <svg
                className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </Link>

          {/* Server status */}
          <div className="flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-[#1A3A52]/70 border border-[#D4AF37]/30 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-[#D4AF37]/90">Servidores Online</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 px-6 lg:px-12 py-20 max-w-6xl mx-auto"
      >
        <div className="text-center mb-14">
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#D4AF37] mb-2">
            Recursos do Jogo
          </h2>
          <GoldDivider />
          <p className="text-white/60 max-w-xl mx-auto mt-4">
            Tudo que você precisa para uma experiência RPG completa, direto no
            navegador.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-lg bg-[#1A3A52]/70 border-2 border-[#D4AF37]/30 backdrop-blur-sm hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-2xl mb-4 group-hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-shadow">
                {feature.icon}
              </div>
              <h3 className="font-cinzel text-lg font-bold text-[#D4AF37] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Classes Section */}
      <section
        id="classes"
        className="relative z-10 px-6 lg:px-12 py-20 border-t border-[#D4AF37]/20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#D4AF37] mb-2">
              Escolha Sua Classe
            </h2>
            <GoldDivider />
            <p className="text-white/60 max-w-xl mx-auto mt-4">
              Selecione entre 8 classes únicas, cada uma com habilidades e
              estilos de jogo distintos.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
            {CLASSES.map((cls, i) => (
              <div
                key={i}
                className="relative rounded-lg bg-[#1A3A52]/70 border-2 border-[#D4AF37]/30 overflow-hidden hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all group cursor-default"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative pt-4 px-4">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-lg overflow-hidden border-2 border-[#D4AF37]/40 group-hover:border-[#D4AF37] transition-colors bg-white/5">
                    <Image
                      src={cls.img}
                      alt={cls.name}
                      width={120}
                      height={120}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="relative p-4 text-center">
                  <div className="font-cinzel font-bold text-[#D4AF37] text-sm mb-0.5">
                    {cls.name}
                  </div>
                  <div className="text-[11px] text-white/50">{cls.weapon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Worlds Section */}
      <section
        id="worlds"
        className="relative z-10 px-6 lg:px-12 py-20 border-t border-[#D4AF37]/20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#D4AF37] mb-2">
              Três Mundos para Explorar
            </h2>
            <GoldDivider />
            <p className="text-white/60 max-w-xl mx-auto mt-4">
              Cada mapa tem sua própria atmosfera, NPCs e desafios únicos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WORLDS.map((world, i) => (
              <div
                key={i}
                className="rounded-lg overflow-hidden border-2 border-[#D4AF37]/30 hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all"
              >
                <div className="h-36 bg-gradient-to-br from-[#1A3A52] to-[#7B3FF2]/30 flex flex-col items-center justify-center gap-2 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0E27]/50" />
                  <span className="text-5xl relative z-10">{world.icon}</span>
                  <span className="text-xs text-[#D4AF37]/80 font-cinzel font-bold uppercase tracking-widest relative z-10">
                    {world.type}
                  </span>
                </div>
                <div className="p-6 bg-[#1A3A52]/50">
                  <h3 className="font-cinzel text-lg font-bold text-[#D4AF37] mb-4">
                    {world.name}
                  </h3>
                  <ul className="space-y-2.5">
                    {world.items.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-3 text-sm text-white/60"
                      >
                        <span className="w-1.5 h-1.5 rotate-45 bg-[#D4AF37] flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section
        id="news"
        className="relative z-10 px-6 lg:px-12 py-20 border-t border-[#D4AF37]/20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#D4AF37] mb-2">
              Últimas Notícias
            </h2>
            <GoldDivider />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {NEWS.map((news, i) => (
              <div
                key={i}
                className="p-6 rounded-lg bg-[#1A3A52]/60 border-2 border-[#D4AF37]/25 hover:border-[#D4AF37]/60 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all"
              >
                <h3 className="font-cinzel font-bold text-[#D4AF37] mb-1.5 text-sm sm:text-base">
                  <span className="mr-2">{news.icon}</span>
                  {news.title}
                </h3>
                <p className="text-[#D4AF37]/50 text-xs mb-3 font-medium">
                  {news.date}
                </p>
                <p className="text-sm text-white/60 leading-relaxed">
                  {news.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-12 py-20 text-center border-t border-[#D4AF37]/20">
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_70%)] pointer-events-none" />
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#D4AF37] mb-3 relative">
            Pronto para a Aventura?
          </h2>
          <GoldDivider />
          <p className="text-white/50 mb-10 mt-4 relative text-lg">
            Nenhum download necessário. Basta escolher um nickname e começar a
            jogar agora mesmo!
          </p>
          <Link
            href="/play"
            className="relative inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] border-2 border-[#FFD700] text-[#0A0E27] font-cinzel font-black text-lg rounded-lg tracking-widest hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] hover:-translate-y-1 transition-all uppercase animate-border-glow"
          >
            Jogar Agora Gratuitamente
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t-2 border-[#D4AF37]/50 px-6 lg:px-12 py-10 bg-[#0A0E27]/95">
        <div className="max-w-6xl mx-auto text-center">
          <Image
            src="/rpg-assets/logo_aldoria.png"
            alt="Legends of Aldoria"
            width={220}
            height={90}
            className="h-16 w-auto mx-auto mb-4"
          />
          <p className="text-white/40 text-sm mb-6">
            Legends of Aldoria © 2026. Todos os direitos reservados.
          </p>

          <div className="flex justify-center gap-4 mb-6">
            {[
              { icon: "f", title: "Facebook" },
              { icon: "𝕏", title: "Twitter" },
              { icon: "🎮", title: "Discord" },
              { icon: "▶", title: "YouTube" },
              { icon: "📷", title: "Instagram" },
            ].map((social, i) => (
              <a
                key={i}
                href="#"
                title={social.title}
                className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0A0E27] font-bold hover:bg-[#FFD700] hover:scale-110 hover:rotate-6 transition-all text-sm"
              >
                {social.icon}
              </a>
            ))}
          </div>

          <div className="flex justify-center gap-6 text-xs text-white/30">
            <a href="#" className="hover:text-[#D4AF37] transition-colors">
              Termos de Serviço
            </a>
            <span className="text-white/15">|</span>
            <a href="#" className="hover:text-[#D4AF37] transition-colors">
              Política de Privacidade
            </a>
            <span className="text-white/15">|</span>
            <a href="#" className="hover:text-[#D4AF37] transition-colors">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
