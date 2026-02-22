# Discovery: Geração Procedural para Planícies de Aldoria

## O que existe hoje

O mapa atual é essencialmente **estático**:

- Terreno plano (um `Box` único com `y=-0.5`)
- 60 árvores e 25 rochas via `seededRandom` (sempre iguais)
- 1 tipo de árvore, 1 tipo de rocha, 1 tipo de montanha (cones)
- 2 tipos de monstros (`slime`, `goblin`) com spawns fixos
- 1 portal fixo de volta ao castelo
- 5 NPCs estáticos

---

## As 6 Camadas de Geração Procedural

---

### 1. Terreno com Heightmap (Noise-based)

**O que muda:** Chão deixa de ser plano e ganha colinas, vales, platôs, descidas e subidas.

#### Abordagens

| Abordagem | Como funciona | Prós | Contras |
|---|---|---|---|
| **Simplex/Perlin Noise** | Função matemática pura que gera alturas suaves. Multi-octave para detalhes (colinas grandes + ondulações pequenas). | Leve, determinístico com seed, sem dependências externas | Precisa implementar do zero ou usar lib |
| **Diamond-Square** | Algoritmo fractal que subdivide um grid e adiciona ruído em cada passo | Terrenos muito naturais com variação | Menos controle sobre features específicas |
| **PlaneGeometry + vertex displacement** | Usa `PlaneGeometry` do Three.js e desloca os vértices Y com noise | Nativo do Three.js, integra com o que já existe | Precisa de resolução alta para ficar bom |

#### Impacto no código atual

- O `Ground` passaria de um `Box` para um `PlaneGeometry` com vértices deslocados
- O player precisaria de um sistema de **terrain following** (raycasting para achar o Y do chão)
- Monstros também precisariam seguir o terreno
- A `checkCollision` precisaria considerar a altura

#### Libs possíveis

- `simplex-noise` (npm) — leve, sem dependências
- Implementação própria de Perlin noise (~50 linhas)
- `three/examples` já tem utilitários de noise

---

### 2. Sistema de Biomas

**O que muda:** O mapa seria dividido em zonas com identidade visual e gameplay distintos.

#### Possíveis biomas para Aldoria

| Bioma | Visual | Monstros | Objetos | Dificuldade |
|---|---|---|---|---|
| Planície Verde | Grama alta, flores | Slimes, coelhos | Arbustos, fazendas | Fácil |
| Floresta Densa | Árvores altas e juntas, sombrio | Goblins, lobos | Cogumelos, troncos caídos | Médio |
| Pântano | Água rasa, neblina, cores escuras | Esqueletos, gosmas tóxicas | Árvores mortas, lama | Médio-Difícil |
| Colinas Rochosas | Pedras, penhascos, solo seco | Golems, serpentes | Minérios, cavernas | Difícil |
| Ruínas Antigas | Pilares quebrados, magia residual | Fantasmas, sentinelas | Baús raros, portais | Muito Difícil |

#### Abordagens para distribuição de biomas

- **Voronoi**: Gera pontos aleatórios e cada região pertence ao ponto mais próximo. Cria fronteiras orgânicas.
- **Noise-based**: Usa uma camada extra de noise onde faixas de valor mapeiam para biomas diferentes (0–0.2 = pântano, 0.2–0.5 = planície, etc.)
- **Gradient radial**: Centro = fácil, bordas = difícil. Simples e eficaz para RPGs.

---

### 3. Variedade de Objetos (Árvores, Rochas, Estruturas)

**O que muda:** Em vez de 1 `TreeObject`, teríamos N tipos paramétricos.

#### Tipos de árvores possíveis

```
Carvalho    → Tronco grosso, copa arredondada grande, galhos laterais
Pinheiro    → Tronco fino, cones empilhados (estilo RPG clássico)
Salgueiro   → Tronco curvo, "folhas" pendentes (cilindros finos pendurados)
Morta       → Sem folhas, galhos retorcidos, cor escura
Cogumelo    → Tronco curto, copa de cogumelo gigante (lathe/esfera achatada)
Cerejeira   → Copa rosada, pétalas caindo (partículas)
Baobá       → Tronco enorme, copa pequena e larga
```

#### Abordagem técnica

Cada árvore seria gerada por parâmetros:

```typescript
interface TreeParams {
  trunkHeight: number;      // 2-8
  trunkRadius: number;      // 0.1-0.5
  trunkCurve: number;       // 0 = reto, 1 = curvo
  canopyType: 'sphere' | 'cone' | 'flat' | 'weeping' | 'mushroom';
  canopySize: number;       // 0.5-3
  canopyColor: string;      // verde, amarelo, rosado, etc.
  branchCount: number;      // 0-5
  hasRoots: boolean;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
}
```

O bioma determinaria os ranges desses parâmetros, e o noise adicionaria variação individual.

#### Mesmo conceito para rochas

- Pedregulhos arredondados, cristais pontiagudos, formações empilhadas, pedras cobertas de musgo

#### E estruturas

- Ruínas (paredes quebradas, pilares), acampamentos abandonados, totens, altares

---

### 4. Monstros e Spawns Dinâmicos

**O que muda:** Monstros seriam escolhidos pelo bioma + nível de dificuldade, com variações visuais.

#### Sistema de variantes

```
Slime base → Slime de Fogo (vermelho, +dano fire)
           → Slime de Gelo (azul, +slow)
           → Slime Venenoso (roxo, +poison)
           → Slime Dourado (raro, +exp +drop)

Goblin base → Goblin Guerreiro (com escudo)
            → Goblin Arqueiro (ataque à distância)
            → Goblin Xamã (cura outros goblins)
            → Goblin Chefe (boss, 3x tamanho)
```

#### Abordagens de spawn

| Abordagem | Descrição |
|---|---|
| **Zone-based** | Cada bioma define uma tabela de monstros com pesos. Spawns aleatórios dentro da zona. |
| **Density map** | Uma camada de noise controla a densidade de monstros. Zonas "silenciosas" e zonas "perigosas". |
| **Hordes migratórias** | Grupos de monstros que se movem pelo mapa ao longo do tempo. Packs de lobos que patrulham. |
| **Ciclo dia/noite** | Monstros diferentes de dia vs noite. Esqueletos só à noite, etc. |

---

### 5. Portais e Cavernas Procedurais

**O que muda:** Em vez de 1 portal fixo, cavernas surgiriam aleatoriamente no mapa.

#### Possibilidades

| Tipo | Descrição |
|---|---|
| **Cavernas de recurso** | Portais que levam a mini-dungeons com minério, baús. Layout linear simples. |
| **Covis de monstros** | Portais em colinas rochosas. Dentro = arena com boss. Recompensa boa. |
| **Ruínas subterrâneas** | Portais em ruínas. Dungeon com salas e corredores procedurais. |
| **Portais temporários** | Surgem e desaparecem. Evento limitado. Reward exclusivo. |

#### Geração da dungeon interna

Cada caverna poderia ser gerada com um algoritmo de dungeon simples:

- **BSP (Binary Space Partition):** Divide o espaço em salas e conecta com corredores
- **Random Walk:** Um "caminhante" cria o layout andando aleatoriamente
- **Template-based:** Salas pré-desenhadas conectadas aleatoriamente

---

### 6. Seed e Persistência — O Motor de Tudo

**Decisão central:** Como a seed funciona define a "personalidade" do mundo.

| Modelo | Como funciona | Experiência do jogador |
|---|---|---|
| **Seed fixa global** | Uma seed define o mundo para sempre. Todos veem o mesmo mapa. | Mundo estável como Minecraft. Jogadores compartilham landmarks. |
| **Seed rotativa (diária/semanal)** | A seed muda com o tempo. O mundo "regenera". | "Mundo vivo" — toda semana tem coisas novas. Eventos naturais. |
| **Seed por instância** | Cada sessão gera um mapa novo. | Exploração infinita, mas sem persistência. Mais roguelike. |
| **Híbrido** | Estrutura fixa (castelo, cidade) + zonas externas procedurais que rotacionam. | Melhor dos dois mundos. Base familiar + novidade constante. |

#### Recomendação para MMO

O modelo **híbrido** é o mais promissor:

- O castelo e a cidade ficam fixos (âncoras sociais)
- As Planícies de Aldoria usam seed rotativa (semanal?)
- Cavernas são instanciadas por seed única quando o portal é criado
- Monstros e recursos resetam periodicamente

---

## Viabilidade Técnica com o Stack Atual

| Feature | Complexidade | Dependências novas | Risco |
|---|---|---|---|
| Heightmap terrain | Média | `simplex-noise` ou manual | Baixo — Three.js suporta nativamente |
| Sistema de biomas | Média | Nenhuma | Baixo — é lógica pura |
| Variedade de árvores/rochas | Média-Alta | Nenhuma | Baixo — mais componentes R3F |
| Monstros variantes | Média | Nenhuma | Baixo — extensão do que já existe |
| Portais dinâmicos | Baixa | Nenhuma | Baixo — já tem sistema de portais |
| Dungeons procedurais | Alta | Nenhuma | Médio — precisa de pathfinding |
| Terrain following (player) | Média | Nenhuma — raycasting do Three.js | Médio — afeta gameplay |
| Sync multiplayer da seed | Baixa | Nenhuma — seed via Socket.IO | Baixo |

### Performance

O principal risco é o número de objetos 3D. Soluções:

- **InstancedMesh** do Three.js para árvores/rochas repetidas (1 draw call para centenas)
- **LOD (Level of Detail)** — objetos distantes usam geometria simplificada
- **Culling por frustum** — R3F já faz isso automaticamente
- **Chunks** — só renderizar a área ao redor do jogador

---

## Ordem Sugerida de Implementação

1. **Heightmap terrain** — fundação de tudo, muda o feeling do jogo imediatamente
2. **Variedade de árvores/rochas** — impacto visual alto com esforço moderado
3. **Sistema de biomas** — organiza a distribuição de tudo
4. **Monstros variantes** — gameplay mais rico
5. **Portais dinâmicos** — exploração com propósito
6. **Dungeons procedurais** — conteúdo endgame
