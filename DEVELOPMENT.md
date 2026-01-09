# Guia de Desenvolvimento - Ultimate Tic-Tac-Toe

## Estrutura do Projeto

### Arquitetura de Componentes

```
app/page.tsx (State Manager)
    ↓
MainBoard (Orquestrador)
    ↓
MiniBoard (9x - um para cada posição)
    ↓
Cell (81x - 9 por mini tabuleiro)
```

## Fluxo de Dados

### 1. Estado Global (`app/page.tsx`)

O componente principal gerencia todo o estado do jogo usando `useState`:

```typescript
const [gameState, setGameState] = useState<GameState>({
  mainBoard: MainBoard,           // Matriz 3x3 de mini tabuleiros
  miniBoardWinners: MiniBoardWinners, // Rastreamento de vitórias
  currentPlayer: 'X' | 'O',       // Jogador atual
  nextBoardPosition: [row, col] | null, // Tabuleiro obrigatório
  gameWinner: Player | 'draw' | null,   // Vencedor do jogo
  isGameOver: boolean             // Status do jogo
});
```

### 2. Fluxo de Jogada

```
1. Usuário clica em uma célula
   ↓
2. Cell dispara onClick → MiniBoard captura
   ↓
3. MiniBoard valida e propaga → MainBoard
   ↓
4. MainBoard envia para → handleCellClick (page.tsx)
   ↓
5. handleCellClick:
   - Valida a jogada
   - Atualiza o estado do tabuleiro
   - Verifica vitória no mini tabuleiro
   - Verifica vitória no jogo principal
   - Determina próximo tabuleiro obrigatório
   - Atualiza estado global
   ↓
6. React re-renderiza componentes afetados
```

## Validações de Jogada

### Ordem de Validação

1. **Jogo terminado?**
   ```typescript
   if (gameState.isGameOver) return;
   ```

2. **Mini tabuleiro disponível?**
   ```typescript
   if (!isBoardAvailable(boardRow, boardCol, miniBoardWinners, mainBoard)) return;
   ```

3. **Posição obrigatória respeitada?**
   ```typescript
   if (nextBoardPosition !== null && 
       (nextBoardPosition[0] !== boardRow || nextBoardPosition[1] !== boardCol)) {
     return;
   }
   ```

4. **Célula já ocupada?**
   ```typescript
   if (mainBoard[boardRow][boardCol][cellRow][cellCol] !== null) return;
   ```

## Detecção de Vitória

### Mini Tabuleiro

A função `checkWinner` verifica:
- 3 linhas horizontais
- 3 colunas verticais
- 2 diagonais

```typescript
export function checkWinner(board: CellValue[][]): CellValue {
  // Verifica todas as combinações de vitória
  // Retorna 'X', 'O' ou null
}
```

### Jogo Principal

Aplica `checkWinner` na matriz de vencedores de mini tabuleiros:

```typescript
const mainWinner = checkWinner(newMiniBoardWinners);
```

## Navegação entre Tabuleiros

### Regra Principal

Ao jogar na posição `(cellRow, cellCol)`, o próximo jogador deve jogar no mini tabuleiro localizado em `[cellRow, cellCol]` do tabuleiro principal.

**Exemplo:**
- Jogada em (1, 2) → Próximo tabuleiro: `mainBoard[1][2]`

### Exceção

Se o tabuleiro direcionado não está disponível:
- Está vencido, OU
- Está completamente cheio

Então `nextBoardPosition = null` e o jogador pode escolher livremente.

## Estilos e Design

### Mobile-First

Todos os estilos começam para mobile e escalam para telas maiores:

```css
/* Mobile (padrão) */
text-2xl p-2 gap-2

/* Tablet e Desktop */
sm:text-3xl sm:p-4 sm:gap-3
md:text-4xl md:p-6 md:gap-4
```

### Classes Tailwind Chave

**Cell.tsx:**
- `aspect-square`: Mantém proporção quadrada
- `hover:bg-blue-50`: Feedback visual de hover
- `disabled:cursor-not-allowed`: Desabilita interação

**MiniBoard.tsx:**
- `border-blue-500`: Destaque de tabuleiro ativo
- `opacity-60`: Tabuleiro indisponível
- `backdrop-blur-sm`: Efeito de vitória

**MainBoard.tsx:**
- `grid grid-cols-3`: Layout 3x3
- `gap-2 sm:gap-3`: Espaçamento responsivo
- `bg-gray-800`: Separador visual entre mini tabuleiros

## Adicionando Novos Recursos

### 1. Adicionar Animações

Edite `globals.css`:

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.winning-cell {
  animation: pulse 1s infinite;
}
```

### 2. Adicionar Som

```typescript
// utils/sounds.ts
export const playSound = (type: 'move' | 'win' | 'draw') => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.play();
};
```

### 3. Adicionar Histórico de Jogadas

Adicionar ao `GameState`:

```typescript
interface GameState {
  // ... existente
  history: Position[];  // Array de posições jogadas
}
```

### 4. Adicionar IA (Modo Single Player)

Criar `utils/ai.ts`:

```typescript
export function getBestMove(gameState: GameState): Position {
  // Implementar algoritmo Minimax ou heurística
}
```

## Testes

### Executar Testes Unitários

```bash
npm test
```

### Testes Manuais Críticos

1. ✅ Vitória horizontal/vertical/diagonal em mini tabuleiro
2. ✅ Vitória horizontal/vertical/diagonal no jogo principal
3. ✅ Navegação correta entre tabuleiros
4. ✅ Escolha livre quando tabuleiro direcionado indisponível
5. ✅ Empate quando todos os tabuleiros preenchidos
6. ✅ Reiniciar jogo funciona corretamente
7. ✅ Responsividade mobile/tablet/desktop

## Performance

### Otimizações Implementadas

- ✅ Componentes funcionais com React Hooks
- ✅ Imutabilidade de estado (evita re-renders desnecessários)
- ✅ Keys únicas em listas
- ✅ Tailwind CSS (sem CSS-in-JS runtime)

### Otimizações Futuras

- [ ] `React.memo()` em componentes Cell e MiniBoard
- [ ] `useMemo()` para cálculos pesados
- [ ] Code splitting por rota
- [ ] Lazy loading de componentes

## Depuração

### Ver Estado do Jogo

Adicione ao `app/page.tsx`:

```typescript
useEffect(() => {
  console.log('Game State:', gameState);
}, [gameState]);
```

### Ver Tabuleiro no Console

```typescript
const printBoard = () => {
  console.table(gameState.miniBoardWinners);
};
```

## Deploy

### Vercel (Recomendado)

```bash
npm run build
vercel deploy
```

### Outras Plataformas

- **Netlify**: Conecte o repositório Git
- **AWS Amplify**: Deploy via CLI
- **Docker**: Crie Dockerfile com Node.js

## Convenções de Código

### Nomenclatura

- **Componentes**: PascalCase (`MiniBoard.tsx`)
- **Funções**: camelCase (`handleCellClick`)
- **Tipos/Interfaces**: PascalCase (`GameState`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_BOARD_SIZE`)

### Estrutura de Arquivo

```typescript
// 1. Imports
import { ... } from '...';

// 2. Types/Interfaces
interface Props { ... }

// 3. Component
export default function Component({ ... }: Props) {
  // 4. State
  const [state, setState] = useState();
  
  // 5. Handlers
  const handleClick = () => { ... };
  
  // 6. Effects
  useEffect(() => { ... }, []);
  
  // 7. Render
  return (...);
}
```

## Recursos Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Ultimate Tic-Tac-Toe Strategy](https://mathwithbaddrawings.com/2013/06/16/ultimate-tic-tac-toe/)

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## Suporte

Para questões ou sugestões, abra uma issue no repositório.
