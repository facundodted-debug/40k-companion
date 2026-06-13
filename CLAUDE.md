# CLAUDE.md — 40K Companion App

## Qué es este proyecto

Web app React para prepararse para partidas de Warhammer 40K (11ª edición). Corre en el browser, simula un frame de celular (390×844px). No es React Native — es React web puro.

**Dos módulos:**
- **Módulo A:** Asistente de matchup — cargás tu lista + elegís el rival → la app analiza fortalezas, debilidades y plan de juego
- **Módulo B:** Simulador 2D de despliegue y primeros turnos (tablero SVG drag-and-drop)

---

## Stack

| Herramienta | Versión | Uso |
|---|---|---|
| React | 18.3 | Framework UI |
| TypeScript | — | Todo el código |
| Vite | 6.3 | Build tool |
| Tailwind CSS | 4.1 | Utilidades CSS |
| motion (Framer Motion) | 12 | Animaciones de pantalla |
| Lucide React | 0.487 | Íconos |
| pnpm | — | Package manager |

**Comandos:**
```bash
pnpm dev      # desarrollo
pnpm build    # build de producción
```

---

## Estructura del proyecto

```
src/
  app/
    App.tsx                    # Root: routing por estado, phone frame
    components/
      shared.ts                # Tipos + seed data (FACTIONS, UNITS, MISSIONS)
      FactionData.tsx           # FACTION_CATEGORIES (37 subfacciones completas)
      DetachmentDescriptions.ts # Reglas de detachments (12 cubiertos + fallback)
      ScreenHeader.tsx          # ScreenHeader, FactionBadge, Chip (shared UI)
      BottomNav.tsx             # 5-tab bottom navigation
      HomeScreen.tsx            # Dashboard principal
      OnboardingScreen.tsx      # 3 slides de bienvenida
      MyListsScreen.tsx         # Lista de ejércitos guardados
      CreateListScreen.tsx      # Flujo 4 pasos para crear lista
      MatchupConfigScreen.tsx   # Selección rival + lista propia
      MatchupResultScreen.tsx   # Análisis del matchup (loading + resultado)
      MissionSelectScreen.tsx   # Grilla de 6 misiones
      DeploymentBoardScreen.tsx # Tablero SVG con drag-and-drop
      TurnSimulationScreen.tsx  # Simulación por turnos con dados
      missionMaps.ts            # Import de imágenes JPEG de tableros
  store/                        # ← A CREAR: hooks de localStorage
  engine/                       # ← A CREAR: motor de matchup
  data/                         # ← A CREAR: JSONs de facciones
  styles/
    theme.css                   # Design tokens (CSS custom properties)
```

---

## Design system — tokens clave

```css
--background:        #0d0e12   /* fondo global */
--foreground:        #eceef4   /* texto principal */
--card:              #13151c   /* superficie de cards */
--muted:             #1a1d26   /* superficie disabled / secondary */
--muted-foreground:  #6b7280   /* texto secundario */
--primary:           #6e45e2   /* acción primaria (púrpura) */
--accent:            #f0920e   /* CTA / acento (naranja) */
--destructive:       #e84040   /* error / rival */

/* Tokens semánticos 40K */
--own:     #3d7ef0   /* ejército propio */
--rival:   #e84040   /* ejército rival */
--strength: #2db57c  /* fortalezas */
--plan:    #6e45e2   /* plan de juego */
```

**Tipografía:**
- Headers / labels / chips: `Barlow Condensed`, `textTransform: uppercase`, `fontWeight: 700`
- Body text: `Inter`

---

## Estado de implementación

### ✅ Completado — NO modificar

- Todo el sistema visual (`theme.css`, `BottomNav`, `ScreenHeader`, `FactionBadge`, `Chip`)
- `FactionData.tsx` — taxonomía completa de 37 subfacciones con todos sus detachments
- `DetachmentDescriptions.ts` — reglas reales de 12 detachments + fallback
- `OnboardingScreen` — slides animados
- `MissionSelectScreen` — grilla de misiones
- `DeploymentBoardScreen` — tablero SVG completo con drag-and-drop, base types, zoom
- `TurnSimulationScreen` — fases Mover/Disparar/Cargar, D6 SVG, DiceModal, ruler de movimiento
- `CreateListScreen` — flujo de 4 pasos (Faction → Config → Detachment → Units), DPPips, DP budget

### 🔴 Pendiente — esto es lo que hay que construir

1. **Data layer** (`/src/store/`) — persistencia con localStorage
2. **Motor de matchup** (`/src/engine/matchup.ts`) — análisis puro basado en datos
3. **Archivos de datos** (`/src/data/*.json`) — una facción por archivo, schema extensible
4. **Conectar pantallas** — HomeScreen, MyListsScreen, MatchupConfigScreen, MatchupResultScreen usan mock data; hay que conectarlas al store real
5. **Cleanup** — remover botón "Demo" de MyListsScreen; ProfileScreen hardcodeada

---

## Tipos principales

```typescript
// shared.ts
type UnitType = 'infantry' | 'vehicle' | 'monster' | 'character' | 'special'

type Unit = {
  id: string; name: string; shortName: string
  type: UnitType; points: number; factionId: string; role: string
}

type ArmyList = {
  id: string; name: string
  faction: Faction; detachment: Detachment
  keyUnits: Unit[]; totalPoints: number
}

type Mission = {
  id: string; name: string; subtitle: string
  deployment: 'horizontal' | 'diagonal' | 'corner' | 'hammer'
  objectives: number
}
```

---

## Reglas de código

- Todos los colores vía CSS variables (`var(--primary)`), no valores hex directos (salvo tokens 40K como `#3d7ef0` para `--own`)
- Usar `motion/react` (Framer Motion) para animaciones de UI
- Componentes nuevos en `/src/app/components/` o en el directorio del módulo correspondiente
- No usar `react-router` — la navegación es por `useState<Screen>` en `App.tsx`
- No usar `react-dnd` — el drag-and-drop del tablero usa SVG pointer events nativos
