# Review Estrutural — Legends of Aldoria

> Análise completa do projeto antes da implementação de features procedurais.

---

## Resumo Executivo

O projeto tem uma base funcional sólida com boa qualidade visual, mas acumulou **dívida técnica significativa** que vai escalar mal com novas features. Os problemas mais críticos são:

1. **Abuso de `window` como barramento global** (13 propriedades globais)
2. **Arquivos monolíticos** (MapSystem.tsx = 839 linhas, server.mjs = 449 linhas)
3. **Dados duplicados entre client e server** (monster spawns, configs)
4. **Server sem TypeScript** (zero type-safety no backend)
5. **Sem sincronização de mapa entre players** (todos veem todos os monstros)

---

## Problemas Críticos (bloqueariam a geração procedural)

### 1. `window` como Estado Global — 13 propriedades

Atualmente o projeto usa `window` para comunicar entre componentes que não estão na mesma árvore React:

| Propriedade | Escrita em | Lida em | Propósito |
|---|---|---|---|
| `__localPlayerPos` | useGameControls | GameScene, CombatController, MonsterCharacter | Posição do player |
| `__moveDirection` | useGameControls | useCharacterAnimation | Direção do movimento |
| `__combatTarget` | CombatController | useGameControls | Alvo de combate |
| `__clearTarget` | GameScene | useGameControls | Limpar alvo |
| `__combatEventsArr` | useSocket | DamageNumberManager | Eventos de dano |
| `__monstersData` | useSocket | MonsterCharacter, useGameControls | Dados dos monstros |
| `__attackingPlayers` | useSocket | useCharacterAnimation | Players atacando |
| `__cameraYaw` | FollowCamera | useGameControls | Ângulo da câmera |
| `__teleportTo` | useGameControls | useGameControls | Posição de teleporte |
| `checkCollision` | MapSystem | useGameControls, MemoizedMapSystem | Colisão |

**Por que é problema:** 
- Sem tipagem (tudo é `any`)
- Sem ciclo de vida (nunca limpa, memory leaks potenciais)
- Impossível testar unitariamente
- Race conditions quando múltiplos componentes escrevem
- Vai explodir em complexidade com heightmaps, biomas, etc.

**Solução recomendada:** Criar um `GameStore` com Zustand ou um `GameContext` React que centraliza todo esse estado.

---

### 2. MapSystem.tsx — Arquivo Monolítico (839 linhas)

Um único arquivo contém:
- 6 componentes de objetos (Tree, Rock, Wall, Chest, Item, Portal)
- 1 componente de NPC (296 linhas de JSX para um NPC!)
- Mountains
- CastleFloor (com trono, tochas, banners, carpete)
- Ground (com vegetação, pedras, patches de cor)
- MapSystem (wrapper principal)
- `seededRandom` (duplicada do town.ts)
- `checkCollision`
- `portalLabels`

**Por que é problema:**
- Impossível trabalhar em paralelo (qualquer mudança toca esse arquivo)
- Imports de 839 linhas para usar qualquer componente
- Adicionar novos tipos de árvore/rocha vai tornar isso ingerenciável

**Solução recomendada:** Extrair para a estrutura:
```
components/
  map/
    MapSystem.tsx          (~50 linhas, orquestra)
    Ground.tsx             (terreno)
    objects/
      TreeObject.tsx
      RockObject.tsx
      WallObject.tsx
      ChestObject.tsx
      ItemObject.tsx
      PortalObject.tsx
    npc/
      NPCComponent.tsx
    environment/
      Mountains.tsx
      CastleFloor.tsx
```

---

### 3. Dados Duplicados Client/Server

Monster spawns estão definidos em **dois lugares diferentes**:

**Client** (`src/data/maps/town.ts`, linhas 82-88):
```typescript
monsterSpawns: [
  { id: "spawn_slime_1", type: "slime", x: 15, z: 20, count: 3, ... },
  // ...
]
```

**Server** (`server.mjs`, linhas 24-30):
```javascript
const MONSTER_SPAWNS = [
  { id: "spawn_slime_1", type: "slime", x: 15, z: 20, count: 3, ... },
  // ...
]
```

Também: `seededRandom` duplicada entre `town.ts` e `MapSystem.tsx`.

**Por que é problema:** Qualquer mudança nos spawns precisa ser feita em dois lugares. Com geração procedural, a seed precisa produzir o mesmo resultado em ambos os lados.

**Solução recomendada:** Uma única fonte de verdade — dados compartilhados em `src/shared/` ou server como autoritativo.

---

### 4. Server sem TypeScript (server.mjs)

449 linhas de JavaScript puro sem nenhuma tipagem. Variáveis como `players`, `monsters`, `monster.wanderTarget` são objetos `any`.

**Por que é problema:**
- Bugs silenciosos (acessar `.hp` de `undefined` não dá erro até runtime)
- Impossível saber a shape dos dados sem ler todo o código
- Com geração procedural, o server vai crescer significativamente

**Solução recomendada:** Converter para `server.ts` com um build step (ts-node ou tsx), reutilizando os tipos de `src/types/game.ts`.

---

### 5. Sem Sincronização de Mapa

O server não sabe em qual mapa cada player está. Consequências:

- Todos os players recebem `monstersUpdate` de todos os mapas
- Um player na caverna vê monstros das planícies
- Monstros das planícies perseguem players que estão no castelo
- Ao adicionar cavernas procedurais, isso colapsa totalmente

**Solução recomendada:** Adicionar `currentMapId` ao estado do player no server. Usar Socket.IO rooms por mapa.

---

## Problemas Importantes (vão doer durante a implementação)

### 6. play/page.tsx — Múltiplas Responsabilidades (392 linhas)

Contém 6 componentes:
- `NicknameScreen` (tela de login/seleção de classe)
- `TargetInfo` (UI de alvo)
- `PlayerHUD` (barra de HP/EXP)
- `GameScreen` (wrapper do jogo)
- `PlayContent` (flow de login → jogo)
- `PlayPage` (root com SocketProvider)

**Solução:** Extrair para arquivos separados em `src/components/ui/`.

---

### 7. `onPlayerMove` — Prop Morta no MapSystem

`MapSystem` recebe `onPlayerMove` na interface mas **nunca usa**. O movimento real acontece via `window.checkCollision`:

```typescript
// MapSystem: define checkCollision em window
(window as any).checkCollision = checkCollision;

// useGameControls: lê de window  
if ((window as any).checkCollision) {
  return (window as any).checkCollision(x, y, z);
}
```

E no `MemoizedMapSystem` em GameScene, `onPlayerMove` é criado mas nunca é chamado pelo MapSystem.

**Solução:** Remover a prop `onPlayerMove` ou usá-la de verdade em vez do `window`.

---

### 8. Estado Morto e Funções Não Utilizadas

- `interactionTarget` em MapSystem: estado que é `set` mas nunca `read`
- `handleObjectInteract` e `handleNPCInteract`: funções definidas mas nunca referenciadas no JSX
- `currentMap` em useSocket: estado que é set mas nunca lido pelos consumers (o `currentMap` real vem de useGameControls)

---

### 9. Cleanup Ausente no useSocket

```typescript
// useSocket.tsx, linha 164
return () => {};  // ← Não limpa nenhum listener!
```

Deveria remover os listeners de `connect`, `disconnect`, `currentPlayers`, etc. Em dev com StrictMode (que monta 2x), isso pode registrar listeners duplicados.

---

### 10. Performance Logging Sempre Ativo

`perfLog` em GameScene e `monsterPerfLog` em MonsterCharacter fazem `console.log` a cada 3 segundos sempre, incluindo produção:

```typescript
console.log(`[PERF] Renders/3s: ${this.renderCount} | ~FPS(render): ...`);
console.log(`[PERF Monsters useFrame] total calls/3s: ...`);
console.log(`[PERF gameLoop] ticks/3s: ...`);
```

**Solução:** Guardar atrás de `if (process.env.NODE_ENV === 'development')` ou flag.

---

### 11. Componentes 3D Sem `memo`

`TreeObject`, `RockObject`, `WallObject`, `NPCComponent`, `ChestObject`, `ItemObject`, `PortalObject` — nenhum é memoizado. Quando qualquer prop do `MapSystem` muda, todos re-renderizam.

`Mountains`, `CastleFloor`, `Ground` usam `useMemo` internamente mas não são `memo()` no nível de componente.

**Solução:** Envolver os componentes estáticos em `React.memo()`.

---

## Problemas Menores (boas práticas)

### 12. CORS Aberto

```javascript
cors: { origin: "*" }
```

Aceitável em dev, mas precisa ser configurado para produção.

### 13. `Map` como Nome de Tipo

O tipo `Map` em `game.ts` sombreia o `Map` nativo do JavaScript/TypeScript. Isso pode causar confusão:

```typescript
// Isso se refere ao Map nativo ou ao Map do jogo?
const m: Map = ...
```

**Solução:** Renomear para `GameMap` ou `WorldMap`.

### 14. Sem Error Boundary

Nenhum `ErrorBoundary` no React. Se qualquer componente 3D der erro (geometria inválida, shader crash), toda a tela fica branca sem feedback.

### 15. Imports Inconsistentes

`MapSystem` está em `src/components/MapSystem.tsx` mas é um componente de jogo. `GameScene` importa com `../MapSystem`. Todos os outros componentes de jogo estão em `src/components/game/`.

### 16. Sem Validação de Input no Server

O server não valida os dados recebidos via Socket.IO:
- `nickname` pode ser string vazia, objeto, ou undefined
- `pos` (movimento) pode conter valores absurdos (teletransporte hack)
- `monsterId` não é verificado contra injection

---

## Plano de Refatoração Sugerido (antes das features procedurais)

### Prioridade 1 — Fundação (bloqueia procedural)

| # | Tarefa | Esforço | Arquivos |
|---|---|---|---|
| R1 | Criar GameStore (Zustand) para substituir `window.*` | Médio | Novo: gameStore.ts. Modifica: ~8 arquivos |
| R2 | Quebrar MapSystem.tsx em módulos | Médio | Novo: ~10 arquivos. Deleta: MapSystem.tsx |
| R3 | Unificar dados client/server (shared/) | Baixo | Novo: shared/. Modifica: town.ts, server.mjs |
| R4 | Adicionar mapId ao player no server + rooms | Médio | Modifica: server.mjs, useSocket.tsx |

### Prioridade 2 — Qualidade (previne bugs)

| # | Tarefa | Esforço | Arquivos |
|---|---|---|---|
| R5 | Converter server.mjs → server.ts | Médio | Renomeia + tipagem |
| R6 | Limpar código morto (onPlayerMove, interactionTarget, etc.) | Baixo | MapSystem, GameScene |
| R7 | Fix cleanup do useSocket | Baixo | useSocket.tsx |
| R8 | Performance logs condicionais | Baixo | GameScene, MonsterCharacter, useGameControls |

### Prioridade 3 — Organização (manutenibilidade)

| # | Tarefa | Esforço | Arquivos |
|---|---|---|---|
| R9 | Extrair NicknameScreen, PlayerHUD, TargetInfo de play/page.tsx | Baixo | Novos em ui/ |
| R10 | Memo em componentes 3D estáticos | Baixo | ~7 componentes |
| R11 | Renomear tipo `Map` → `GameMap` | Baixo | game.ts + todos que importam |
| R12 | Mover MapSystem para components/game/ ou components/map/ | Baixo | Mover + atualizar imports |
| R13 | Adicionar ErrorBoundary | Baixo | Novo componente |

### Ordem recomendada

```
R6 (limpar mortos) → R8 (logs) → R7 (cleanup)
     ↓
R11 (renomear Map) → R12 (mover MapSystem) → R2 (quebrar MapSystem)
     ↓
R1 (GameStore) → R4 (mapId + rooms)
     ↓
R3 (shared data) → R5 (server.ts)
     ↓
R9, R10, R13 (em qualquer ordem)
```

Total estimado: **3-5 dias** de refatoração antes de iniciar features procedurais.
