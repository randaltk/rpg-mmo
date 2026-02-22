# Plano de Implementação — Mundo Procedural de Aldoria

> Baseado em: [discovery-procedural-world.md](./discovery-procedural-world.md)

---

## Visão Geral das Fases

```
Fase 0 ─ Infraestrutura (seed, noise, types)
Fase 1 ─ Terreno com Heightmap
Fase 2 ─ Variedade de Objetos (árvores, rochas, estruturas)
Fase 3 ─ Sistema de Biomas
Fase 4 ─ Monstros e Spawns Dinâmicos
Fase 5 ─ Portais e Cavernas Procedurais
Fase 6 ─ Polish e Performance
```

Cada fase é independentemente funcional — o jogo continua jogável após cada fase.

---

## Fase 0 — Infraestrutura Base

**Objetivo:** Criar os alicerces que todas as outras fases usarão.

### Tarefa 0.1 — Instalar e configurar Simplex Noise

**O quê:** Adicionar a lib `simplex-noise` ao projeto.

```bash
npm install simplex-noise
```

**Por quê:** Será usada para geração de terreno, distribuição de biomas, posicionamento de objetos, e density maps de monstros.

---

### Tarefa 0.2 — Criar módulo de World Seed

**Criar:** `src/lib/worldgen/seed.ts`

**Responsabilidades:**
- Gerar/receber a seed do mundo (do server via Socket.IO)
- Expor funções de seeded random determinísticas
- Suportar modelo híbrido (seed fixa para estrutura + seed rotativa para conteúdo)

**Interface:**

```typescript
export interface WorldSeed {
  base: number;        // seed permanente do mundo
  seasonal: number;    // seed que roda semanalmente
  timestamp: number;   // quando a seed sazonal foi gerada
}

export function createSeededRNG(seed: number): () => number;
export function hashCoord(x: number, z: number, seed: number): number;
```

**Arquivos afetados:**
- `server.mjs` — gerar e distribuir a seed no evento `join`
- `src/hooks/useSocket.tsx` — receber e armazenar a seed

---

### Tarefa 0.3 — Criar módulo central de World Generation

**Criar:** `src/lib/worldgen/index.ts`

**Responsabilidades:**
- Orquestrar a geração do mundo a partir da seed
- Gerar o heightmap
- Determinar biomas
- Posicionar objetos, monstros e portais
- Retornar um `Map` completo compatível com o tipo atual

**Interface:**

```typescript
export function generateWorld(seed: WorldSeed, config: WorldConfig): Map;

export interface WorldConfig {
  width: number;
  height: number;
  terrainScale: number;
  terrainAmplitude: number;
  biomeScale: number;
  objectDensity: number;
  monsterDensity: number;
  portalCount: { min: number; max: number };
}
```

**Por quê:** Centralizar a lógica evita que a geração fique espalhada entre `town.ts`, `MapSystem.tsx` e `server.mjs`.

---

### Tarefa 0.4 — Expandir os tipos em `game.ts`

**Modificar:** `src/types/game.ts`

**Adicionar:**

```typescript
export type BiomeType = 'plains' | 'forest' | 'swamp' | 'rocky' | 'ruins';

export type TreeVariant = 'oak' | 'pine' | 'willow' | 'dead' | 'mushroom' | 'cherry' | 'baobab';
export type RockVariant = 'boulder' | 'crystal' | 'stacked' | 'mossy' | 'flat';
export type StructureVariant = 'ruins_pillar' | 'ruins_wall' | 'camp' | 'totem' | 'altar';

export interface MapObject {
  // ... campos existentes ...
  variant?: TreeVariant | RockVariant | StructureVariant;
  biome?: BiomeType;
  scale?: number;
  colorOverride?: string;
}

export type MonsterVariant = 'fire' | 'ice' | 'poison' | 'golden' | 'warrior' | 'archer' | 'shaman' | 'chief';

export interface MonsterSpawn {
  // ... campos existentes ...
  variant?: MonsterVariant;
  biome?: BiomeType;
}

export interface Map {
  // ... campos existentes ...
  seed?: WorldSeed;
  heightmap?: Float32Array;
  heightmapResolution?: number;
  biomeMap?: BiomeType[];
  biomeMapResolution?: number;
}
```

---

## Fase 1 — Terreno com Heightmap

**Objetivo:** O chão das Planícies de Aldoria ganha relevo — colinas, vales, platôs.

### Tarefa 1.1 — Criar gerador de heightmap

**Criar:** `src/lib/worldgen/terrain.ts`

**O quê:** Função que usa multi-octave simplex noise para gerar um `Float32Array` de alturas.

**Algoritmo:**
```
Para cada ponto (x, z) no grid:
  height = 0
  Para cada octave (amplitude, frequência):
    height += simplex(x * freq, z * freq) * amplitude
  
  // Achatar o centro (zona segura ao redor do spawn)
  centerDist = distância ao centro do mapa
  if centerDist < safeRadius:
    height *= smoothstep(centerDist / safeRadius)
  
  // Clampar valores extremos
  height = clamp(height, minHeight, maxHeight)
```

**Parâmetros tunáveis:**
- `octaves`: 4-6 (mais octaves = mais detalhes)
- `persistence`: 0.5 (quanto cada octave diminui)
- `lacunarity`: 2.0 (quanto cada octave aumenta a frequência)
- `amplitude`: 8.0 (altura máxima das colinas)
- `safeRadius`: 15 (raio plano ao redor do spawn)

---

### Tarefa 1.2 — Substituir o Ground por PlaneGeometry com heightmap

**Modificar:** `src/components/MapSystem.tsx` — componente `Ground`

**Mudanças:**
1. Trocar `<Box args={[width, 1, height]}>` por `<mesh>` com `PlaneGeometry`
2. Deslocar vértices Y usando o heightmap
3. Recalcular normais para iluminação correta
4. Aplicar cores do vertex baseadas na altura (verde embaixo, marrom nas colinas, cinza nos picos)

**Pseudo-código:**
```typescript
const geometry = useMemo(() => {
  const geo = new THREE.PlaneGeometry(width, height, resolution, resolution);
  geo.rotateX(-Math.PI / 2);
  
  const positions = geo.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const h = sampleHeightmap(x, z, heightmap, resolution);
    positions.setY(i, h);
    
    // Vertex colors baseadas na altura
    const color = getTerrainColor(h, biome);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}, [heightmap]);
```

---

### Tarefa 1.3 — Implementar terrain following para o player

**Modificar:** `src/hooks/useGameControls.ts`

**O quê:** O game loop precisa consultar a altura do terreno na posição atual do player e ajustar `localPos.y`.

**Abordagem:** Interpolar a altura no heightmap em vez de raycasting (mais leve).

```typescript
// No game loop, após calcular newX/newZ:
const terrainY = getHeightAt(newX, newZ, currentMapRef.current);
localPos.y = terrainY;
```

**Criar função utilitária:** `src/lib/worldgen/terrain.ts`

```typescript
export function getHeightAt(
  x: number, z: number,
  heightmap: Float32Array,
  mapWidth: number, mapHeight: number,
  resolution: number
): number;
```

Essa função faz interpolação bilinear no heightmap para retornar uma altura suave.

---

### Tarefa 1.4 — Terrain following para monstros

**Modificar:** `server.mjs`

**O quê:** O server também precisa do heightmap para posicionar monstros corretamente.

**Abordagem:** 
- Gerar o heightmap no server (mesma seed = mesmo resultado)
- Em `updateMonsters`, ajustar `monster.y` usando `getHeightAt`
- Compartilhar a lógica de noise (arquivo `.mjs` ou módulo isomórfico)

**Criar:** `src/lib/worldgen/terrain-shared.mjs` — versão isomórfica do gerador

---

### Tarefa 1.5 — Atualizar Mountains para seguir o heightmap

**Modificar:** `src/components/MapSystem.tsx` — componente `Mountains`

**O quê:** Montanhas deixam de ser cones independentes e passam a ser "picos" do heightmap — zonas onde a amplitude do noise é forçada para cima.

**Abordagem:** No gerador de terreno, adicionar "mountain nodes" — pontos onde a amplitude é amplificada, criando picos naturais. As montanhas visuais com neve continuam como meshes separadas posicionadas nesses picos.

---

### Tarefa 1.6 — Atualizar checkCollision e câmera

**Modificar:**
- `src/components/MapSystem.tsx` — `checkCollision` agora considera a altura do terreno
- `src/components/game/FollowCamera.tsx` — câmera ajusta target.y com base no terreno

---

## Fase 2 — Variedade de Objetos

**Objetivo:** Árvores, rochas e estruturas ganham variedade visual.

### Tarefa 2.1 — Criar componentes de árvores variantes

**Criar:** `src/components/game/objects/trees/`

| Arquivo | Componente | Visual |
|---|---|---|
| `OakTree.tsx` | `OakTree` | Tronco grosso, copa esférica grande, galhos laterais |
| `PineTree.tsx` | `PineTree` | Tronco fino, 3-4 cones empilhados |
| `WillowTree.tsx` | `WillowTree` | Tronco curvo, cilindros finos pendurados como folhagem |
| `DeadTree.tsx` | `DeadTree` | Sem folhagem, galhos retorcidos (cones finos em ângulos), cor escura |
| `MushroomTree.tsx` | `MushroomTree` | Tronco curto, esfera achatada colorida no topo |
| `CherryTree.tsx` | `CherryTree` | Copa rosada, partículas de pétalas |
| `BaobabTree.tsx` | `BaobabTree` | Tronco muito grosso, copa achatada e larga |

**Interface unificada:** Todos recebem `{ obj: MapObject }` e usam `obj.scale`, `obj.colorOverride`.

**Refatorar:** O `TreeObject` atual vira o `OakTree` (baseline), e o `MapObjectComponent` usa o `variant` para escolher o componente.

---

### Tarefa 2.2 — Criar componentes de rochas variantes

**Criar:** `src/components/game/objects/rocks/`

| Arquivo | Componente | Visual |
|---|---|---|
| `BoulderRock.tsx` | `BoulderRock` | Pedregulho arredondado (atual, refinado) |
| `CrystalRock.tsx` | `CrystalRock` | Cristais coloridos pontiagudos (cones com emissive) |
| `StackedRock.tsx` | `StackedRock` | Pedras empilhadas (cairn) |
| `MossyRock.tsx` | `MossyRock` | Rocha com manchas verdes de musgo |
| `FlatRock.tsx` | `FlatRock` | Pedra larga e achatada (stepping stones) |

---

### Tarefa 2.3 — Criar componentes de estruturas

**Criar:** `src/components/game/objects/structures/`

| Arquivo | Componente | Visual |
|---|---|---|
| `RuinsPillar.tsx` | `RuinsPillar` | Coluna quebrada com pedaços no chão |
| `RuinsWall.tsx` | `RuinsWall` | Parede parcialmente destruída |
| `Camp.tsx` | `Camp` | Tenda, fogueira apagada, troncos para sentar |
| `Totem.tsx` | `Totem` | Poste de madeira com rosto esculpido e brilho mágico |
| `Altar.tsx` | `Altar` | Mesa de pedra com runas brilhantes |

---

### Tarefa 2.4 — Atualizar MapObjectComponent para usar variants

**Modificar:** `src/components/MapSystem.tsx`

**Mudança:** O `switch` no `MapObjectComponent` passa a consultar `obj.variant`:

```typescript
case 'tree':
  switch (obj.variant) {
    case 'pine': return <PineTree obj={obj} />;
    case 'willow': return <WillowTree obj={obj} />;
    case 'dead': return <DeadTree obj={obj} />;
    // ...
    default: return <OakTree obj={obj} />;
  }
```

---

### Tarefa 2.5 — Posicionamento procedural de objetos

**Criar:** `src/lib/worldgen/objects.ts`

**O quê:** Dado o heightmap e o biome map, posicionar objetos com:
- Distribuição por Poisson disk sampling (evita clustering)
- Variant escolhida pelo bioma
- Escala e cor com variação seeded random
- Objetos alinham-se ao terreno (y = heightAt(x,z))
- Evitar sobreposição com portais, NPCs, e spawn points

**Interface:**

```typescript
export function generateObjects(
  heightmap: Float32Array,
  biomeMap: BiomeType[],
  seed: number,
  config: ObjectGenerationConfig
): MapObject[];
```

---

## Fase 3 — Sistema de Biomas

**Objetivo:** O mapa é dividido em zonas temáticas que determinam visual e gameplay.

### Tarefa 3.1 — Criar gerador de biome map

**Criar:** `src/lib/worldgen/biomes.ts`

**Algoritmo:** Noise-based com gradient radial para dificuldade:

```
Para cada ponto (x, z):
  // Noise para variação
  moisture = simplex(x * biomeScale, z * biomeScale, seed + 1000)
  temperature = simplex(x * biomeScale * 0.7, z * biomeScale * 0.7, seed + 2000)
  
  // Gradient radial (centro = fácil)
  distFromCenter = distância ao centro / raio do mapa
  difficulty = distFromCenter  // 0 no centro, 1 na borda
  
  // Decisão do bioma
  if difficulty < 0.3:
    biome = 'plains'           // Centro: planície segura
  else if moisture > 0.3 && temperature > 0:
    biome = 'forest'           // Zona úmida e temperada
  else if moisture > 0.3 && temperature < 0:
    biome = 'swamp'            // Zona úmida e fria
  else if difficulty > 0.7:
    biome = 'rocky'            // Bordas: colinas rochosas
  else if hasRuinsNode(x, z):
    biome = 'ruins'            // Pontos especiais de ruínas
  else:
    biome = 'plains'
```

---

### Tarefa 3.2 — Cada bioma define suas regras

**Criar:** `src/lib/worldgen/biome-configs.ts`

```typescript
export interface BiomeConfig {
  groundColor: string;
  groundColorVariation: string[];
  treeDensity: number;        // 0-1
  treeVariants: TreeVariant[];
  rockDensity: number;
  rockVariants: RockVariant[];
  structureDensity: number;
  structureVariants: StructureVariant[];
  terrainAmplitudeMultiplier: number;
  monsterTable: { type: Monster['type']; variant?: MonsterVariant; weight: number; levelRange: [number, number] }[];
  fogColor?: string;
  fogDensity?: number;
  ambientLight?: string;
  vegetationDensity: number;
  vegetationColors: string[];
}
```

**Configs por bioma:**

| Bioma | Árvores | Rochas | Estruturas | Amplitude |
|---|---|---|---|---|
| Plains | oak, cherry (alta) | boulder, mossy (baixa) | camp (rara) | 1.0x |
| Forest | oak, pine, willow (muito alta) | mossy, stacked (média) | totem (rara) | 0.8x |
| Swamp | dead, mushroom (média) | flat, mossy (média) | altar (rara) | 0.5x |
| Rocky | pine, dead (baixa) | boulder, crystal, stacked (muito alta) | ruins_pillar, ruins_wall (média) | 2.0x |
| Ruins | dead (baixa) | stacked (alta) | ruins_pillar, ruins_wall, altar (muito alta) | 1.5x |

---

### Tarefa 3.3 — Vertex colors do terreno por bioma

**Modificar:** `src/components/MapSystem.tsx` — componente `Ground`

**O quê:** As cores dos vértices do terreno não dependem só da altura, mas também do bioma naquele ponto. Transições suaves entre biomas usando interpolação.

```typescript
function getTerrainColor(height: number, biome: BiomeType): THREE.Color {
  const config = BIOME_CONFIGS[biome];
  // Gradiente: base → grama → terra → pedra (por altura)
  // Cores base mudam por bioma
}
```

---

### Tarefa 3.4 — Ambiente visual por bioma (fog, luz)

**Modificar:** `src/components/game/GameScene.tsx` — componente `SceneEnvironment`

**O quê:** Quando o player entra em certos biomas, o fog e a luz ambiente mudam suavemente.

**Abordagem:** O bioma do player é determinado pela posição atual. O `SceneEnvironment` recebe o bioma como prop e faz lerp entre configs.

---

## Fase 4 — Monstros e Spawns Dinâmicos

**Objetivo:** Monstros variados spawnam baseados no bioma, com variantes visuais e de gameplay.

### Tarefa 4.1 — Criar modelos de novos monstros

**Criar:** `src/components/game/monsters/`

| Arquivo | Monstro | Visual base |
|---|---|---|
| `WolfModel.tsx` | Lobo | Corpo quadrúpede, focinho, cauda, pelo |
| `SkeletonModel.tsx` | Esqueleto | Humanóide ossudo, espada, sem carne (meshes brancos) |

**Também criar variantes visuais** que modificam os modelos existentes:

| Variante | Modificação visual |
|---|---|
| Fire | Cor vermelha/laranja, emissive, partículas de fogo |
| Ice | Cor azul/cyan, emissive frio, cristais de gelo |
| Poison | Cor roxa/verde, emissive, gotejamento (partículas) |
| Golden | Cor dourada, brilho metálico, efeito de sparkle |
| Warrior | (Goblin) escudo adicional no braço esquerdo |
| Archer | (Goblin) arco em vez de clava, no braço direito |
| Shaman | (Goblin) staff com orbe brilhante, chapéu |
| Chief | 1.5x-2x escala, decorações extras |

---

### Tarefa 4.2 — Atualizar `MonsterCharacter.tsx` para suportar variantes

**Modificar:** `src/components/game/MonsterCharacter.tsx`

**O quê:**
- Importar os novos modelos
- Usar `monster.type` para selecionar o modelo base
- Usar `monster.variant` (novo campo) para aplicar modificações
- Variantes afetam: cor, emissive, escala, equipamento visual

---

### Tarefa 4.3 — Gerador de spawns por bioma

**Criar:** `src/lib/worldgen/monsters.ts`

**O quê:** Dado o biome map e o heightmap, gerar `MonsterSpawn[]` com:
- Tipo de monstro baseado no bioma (usando a monster table do biome config)
- Level baseado na distância do centro (gradient radial de dificuldade)
- Variante escolhida aleatoriamente com pesos
- Posição evitando sobreposição com objetos e portais

**Interface:**

```typescript
export function generateMonsterSpawns(
  biomeMap: BiomeType[],
  heightmap: Float32Array,
  seed: number,
  config: MonsterGenerationConfig
): MonsterSpawn[];
```

---

### Tarefa 4.4 — Atualizar o server para spawns dinâmicos

**Modificar:** `server.mjs`

**O quê:**
- `MONSTER_SPAWNS` deixa de ser constante hardcoded
- Quando o server inicia, gera os spawns usando a mesma seed
- Adicionar `MONSTER_BASE_STATS` para `wolf` e `skeleton` (já existem mas não são usados)
- Cada monstro recebe a `variant` e tem stats modificados por ela

**Stats de variantes:**
```javascript
const VARIANT_MODIFIERS = {
  fire:    { attack: 1.3, defense: 0.9, hp: 1.0, expReward: 1.3 },
  ice:     { attack: 1.0, defense: 1.3, hp: 1.1, expReward: 1.3 },
  poison:  { attack: 1.1, defense: 1.0, hp: 0.9, expReward: 1.2 },
  golden:  { attack: 1.0, defense: 1.5, hp: 2.0, expReward: 3.0 },
  warrior: { attack: 1.2, defense: 1.5, hp: 1.3, expReward: 1.5 },
  archer:  { attack: 1.5, defense: 0.7, hp: 0.8, expReward: 1.4 },
  shaman:  { attack: 0.8, defense: 1.0, hp: 1.0, expReward: 1.6 },
  chief:   { attack: 1.8, defense: 2.0, hp: 3.0, expReward: 5.0 },
};
```

---

### Tarefa 4.5 — Enviar tipo de monstro e variante ao client

**Modificar:**
- `src/types/game.ts` — `Monster` ganha campo `variant?: MonsterVariant`
- `server.mjs` — incluir `variant` nos dados enviados
- `src/hooks/useSocket.tsx` — garantir que o campo é preservado

---

## Fase 5 — Portais e Cavernas Procedurais

**Objetivo:** Portais aparecem aleatoriamente no mapa, levando a cavernas únicas.

### Tarefa 5.1 — Gerador de portais procedurais

**Criar:** `src/lib/worldgen/portals.ts`

**O quê:** Posicionar N portais no mapa com:
- Localização em biomas rochosos/ruins preferencialmente
- Cada portal tem um ID único baseado na seed + posição
- O portal define a seed da caverna interna
- Diferentes tiers de dificuldade

**Interface:**

```typescript
export interface ProceduralPortal {
  id: string;
  position: { x: number; z: number };
  tier: 'easy' | 'medium' | 'hard' | 'boss';
  caveSeed: number;
  biome: BiomeType;
  label: string;
}

export function generatePortals(
  biomeMap: BiomeType[],
  heightmap: Float32Array,
  seed: number,
  config: PortalGenerationConfig
): ProceduralPortal[];
```

---

### Tarefa 5.2 — Gerador de layout de cavernas

**Criar:** `src/lib/worldgen/dungeon.ts`

**O quê:** Dado uma seed de caverna, gerar um `Map` completo de dungeon.

**Algoritmo (Random Walk + Templates):**
```
1. Começar num ponto central
2. Random walk para criar o layout (grid de tiles "chão" vs "parede")
3. Identificar "salas" (clusters de tiles abertos)
4. Conectar salas com corredores
5. Colocar portal de saída na sala mais distante
6. Colocar monstros progressivamente mais difíceis
7. Colocar baús/recompensas nas salas laterais
8. Colocar boss na sala final (para tier 'boss')
```

**Saída:** Um `Map` com paredes, objetos, monstros, portais.

---

### Tarefa 5.3 — Integrar cavernas ao sistema de portais

**Modificar:**
- `src/hooks/useGameControls.ts` — `checkAutoPortal` agora gera a caverna on-demand
- `src/data/maps/index.ts` — suportar mapas dinâmicos (gerados em runtime)
- `server.mjs` — monstros das cavernas também são gerenciados

**Fluxo:**
```
Player pisa no portal
  → Client gera o Map da caverna usando caveSeed
  → Client manda 'enterDungeon' { portalId, caveSeed } ao server
  → Server gera os monstros da caverna
  → Player é teleportado
  → Ao sair, volta ao portal de origem
```

---

### Tarefa 5.4 — Portal visual com tier

**Modificar:** `src/components/MapSystem.tsx` — `PortalObject`

**O quê:** Portais procedurais têm visual diferente por tier:
- Easy: portal azul, arco simples
- Medium: portal roxo, arco com runas
- Hard: portal vermelho, arco com caveiras
- Boss: portal dourado, arco ornamentado, partículas

---

## Fase 6 — Polish e Performance

**Objetivo:** Otimizar e polir a experiência.

### Tarefa 6.1 — InstancedMesh para objetos repetidos

**Modificar:** `src/components/MapSystem.tsx`

**O quê:** Agrupar árvores/rochas do mesmo tipo em `InstancedMesh` para reduzir draw calls.

**Impacto esperado:** De centenas de draw calls para ~10-15 por tipo de objeto.

```typescript
// Em vez de renderizar cada árvore individualmente:
<OakTree obj={obj} /> // 60 componentes = 60+ draw calls

// Usar InstancedMesh:
const oakInstances = useMemo(() => {
  const mesh = new THREE.InstancedMesh(oakGeometry, oakMaterial, count);
  objects.forEach((obj, i) => {
    matrix.compose(position, rotation, scale);
    mesh.setMatrixAt(i, matrix);
  });
  return mesh;
}, [objects]);
```

---

### Tarefa 6.2 — LOD (Level of Detail)

**Criar:** `src/components/game/objects/LODWrapper.tsx`

**O quê:** Componente que troca a geometria com base na distância da câmera.

- Perto (< 20u): geometria completa
- Médio (20-50u): geometria simplificada (menos polígonos)
- Longe (> 50u): billboard ou ponto colorido

---

### Tarefa 6.3 — Chunk-based rendering

**Criar:** `src/components/game/ChunkSystem.tsx`

**O quê:** Dividir o mapa em chunks (ex: 20x20) e só renderizar chunks visíveis.

**Benefício:** Mapa de 150x150 = ~56 chunks, mas só ~9 visíveis ao mesmo tempo.

---

### Tarefa 6.4 — Transições suaves de bioma (visual)

**O quê:** Ao andar entre biomas, fog/luz/música mudam gradualmente (lerp ao longo de ~5 segundos).

---

### Tarefa 6.5 — Sync de seed multiplayer

**Modificar:** `server.mjs` e `src/hooks/useSocket.tsx`

**O quê:** Garantir que todos os jogadores veem o mesmo mundo:
- Server gera a seed na inicialização
- Seed é enviada no evento `join`
- Seed sazonal roda semanalmente (baseada na semana ISO)
- Quando a seed muda, todos são notificados e o mapa regenera

```javascript
// server.mjs
function getSeasonalSeed() {
  const now = new Date();
  const week = getISOWeek(now);
  const year = now.getFullYear();
  return hashString(`${year}-W${week}`);
}
```

---

## Estrutura de Pastas Final

```
src/
├── lib/
│   └── worldgen/
│       ├── index.ts              # Orquestrador principal
│       ├── seed.ts               # Geração e utilitários de seed
│       ├── terrain.ts            # Heightmap via simplex noise
│       ├── terrain-shared.mjs    # Versão isomórfica para server
│       ├── biomes.ts             # Geração do biome map
│       ├── biome-configs.ts      # Configs de cada bioma
│       ├── objects.ts            # Posicionamento de objetos
│       ├── monsters.ts           # Spawns de monstros
│       ├── portals.ts            # Portais procedurais
│       └── dungeon.ts            # Geração de dungeons
├── components/
│   ├── game/
│   │   ├── objects/
│   │   │   ├── trees/
│   │   │   │   ├── OakTree.tsx
│   │   │   │   ├── PineTree.tsx
│   │   │   │   ├── WillowTree.tsx
│   │   │   │   ├── DeadTree.tsx
│   │   │   │   ├── MushroomTree.tsx
│   │   │   │   ├── CherryTree.tsx
│   │   │   │   └── BaobabTree.tsx
│   │   │   ├── rocks/
│   │   │   │   ├── BoulderRock.tsx
│   │   │   │   ├── CrystalRock.tsx
│   │   │   │   ├── StackedRock.tsx
│   │   │   │   ├── MossyRock.tsx
│   │   │   │   └── FlatRock.tsx
│   │   │   └── structures/
│   │   │       ├── RuinsPillar.tsx
│   │   │       ├── RuinsWall.tsx
│   │   │       ├── Camp.tsx
│   │   │       ├── Totem.tsx
│   │   │       └── Altar.tsx
│   │   ├── monsters/
│   │   │   ├── WolfModel.tsx
│   │   │   └── SkeletonModel.tsx
│   │   ├── LODWrapper.tsx
│   │   └── ChunkSystem.tsx
```

---

## Dependências entre Tarefas

```
0.1 (simplex-noise) ──→ 1.1 (heightmap)
0.2 (seed) ────────────→ 1.1, 3.1, 4.3, 5.1
0.3 (worldgen index) ──→ depende de 1.1, 2.5, 3.1, 4.3, 5.1
0.4 (types) ───────────→ 2.*, 4.*, 5.*

1.1 (heightmap) ───────→ 1.2 (ground visual)
1.1 ───────────────────→ 1.3 (player terrain following)
1.1 ───────────────────→ 1.4 (monster terrain following)
1.2 ───────────────────→ 1.5 (mountains)
1.3 ───────────────────→ 1.6 (collision + câmera)

2.1-2.3 (componentes) ─→ 2.4 (MapObjectComponent)
2.4 ───────────────────→ 2.5 (posicionamento procedural)

3.1 (biome map) ───────→ 3.2 (configs)
3.2 ───────────────────→ 3.3 (vertex colors)
3.2 ───────────────────→ 3.4 (ambiente)
3.2 ───────────────────→ 2.5 (objetos usam biomas)
3.2 ───────────────────→ 4.3 (monstros usam biomas)

4.1 (modelos) ─────────→ 4.2 (MonsterCharacter)
4.3 (spawns) ──────────→ 4.4 (server)
4.4 ───────────────────→ 4.5 (sync client)

5.1 (portais) ─────────→ 5.3 (integração)
5.2 (dungeon gen) ─────→ 5.3 (integração)
5.3 ───────────────────→ 5.4 (visual)

6.1-6.5 podem ser feitas em qualquer ordem após Fase 1-5
```

---

## Estimativas de Esforço

| Fase | Tarefas | Esforço estimado | Arquivos novos | Arquivos modificados |
|---|---|---|---|---|
| Fase 0 | 4 | 1 dia | 3 | 2 |
| Fase 1 | 6 | 2-3 dias | 2 | 4 |
| Fase 2 | 5 | 2-3 dias | 13 | 1 |
| Fase 3 | 4 | 1-2 dias | 2 | 2 |
| Fase 4 | 5 | 2-3 dias | 3 | 3 |
| Fase 5 | 4 | 2-3 dias | 2 | 3 |
| Fase 6 | 5 | 2-3 dias | 2 | 3 |
| **Total** | **33 tarefas** | **~12-18 dias** | **~27 arquivos** | **~10 arquivos** |

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Performance com muitos objetos 3D | Frame drops | InstancedMesh (6.1) + LOD (6.2) + Chunks (6.3) |
| Heightmap inconsistente client/server | Monstros flutuando | Módulo isomórfico de terreno (1.4) |
| Seed dessinc entre players | Mundos diferentes | Server é fonte da verdade para seed (0.2) |
| Dungeons muito complexas | Scope creep | Começar com layout simples (linear) e evoluir |
| Transições de bioma feias | Visual ruim | Interpolação suave de vertex colors (3.3) |
