# Ultimate Tic-Tac-Toe

Uma aplicação web completa do jogo **Ultimate Tic-Tac-Toe** construída com Next.js 16, React, TypeScript e Tailwind CSS, seguindo rigorosamente o conceito **mobile-first**.

## 🎮 Sobre o Jogo

Ultimate Tic-Tac-Toe é uma versão estratégica do jogo da velha tradicional. O tabuleiro consiste em um grid 3x3 de mini tabuleiros, cada um sendo um jogo da velha 3x3.

### Regras

1. **Estrutura**: Um tabuleiro principal 3x3 contém 9 mini tabuleiros 3x3
2. **Jogadores**: Dois jogadores alternam turnos (X e O)
3. **Primeira jogada**: O jogador inicial pode escolher qualquer mini tabuleiro
4. **Navegação**: Sua jogada em uma célula (linha, coluna) determina o próximo mini tabuleiro onde o adversário deve jogar
   - Exemplo: jogar na posição (0,2) envia o próximo jogador para o mini tabuleiro da linha 0, coluna 2
5. **Exceção**: Se o mini tabuleiro direcionado já estiver completo ou vencido, o jogador pode escolher livremente
6. **Vitória no mini tabuleiro**: Complete 3 em linha (horizontal, vertical ou diagonal) em um mini tabuleiro
7. **Vitória no jogo**: Conquiste 3 mini tabuleiros em linha no tabuleiro principal

## 🚀 Tecnologias

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **ESLint**

## 📱 Design Mobile-First

A aplicação foi desenvolvida priorizando dispositivos móveis:

- Interface responsiva que se adapta de smartphones pequenos até desktops
- Feedback visual claro para tabuleiros ativos/inativos
- Controles touch-friendly
- Prevenção de zoom acidental
- Otimização de performance para dispositivos móveis

## 🏗️ Arquitetura

### Estrutura de Pastas

```
ultimate-tic-tac-toe/
├── app/
│   ├── globals.css       # Estilos globais mobile-first
│   ├── layout.tsx        # Layout raiz com metadados
│   └── page.tsx          # Página principal com lógica do jogo
├── components/
│   ├── Cell.tsx          # Componente de célula individual
│   ├── MiniBoard.tsx     # Componente de mini tabuleiro 3x3
│   └── MainBoard.tsx     # Componente do tabuleiro principal
├── types/
│   └── game.ts           # Tipos e interfaces TypeScript
└── utils/
    └── gameLogic.ts      # Lógica de verificação de vitória
```

### Componentização

- **Cell**: Célula individual com estados (vazio, X, O) e feedback visual
- **MiniBoard**: Mini tabuleiro 3x3 com indicação de ativo/inativo/vencido
- **MainBoard**: Tabuleiro principal orquestrando 9 mini tabuleiros
- **Page**: Gerenciamento de estado global e lógica do jogo

### Gerenciamento de Estado

O estado do jogo é gerenciado com `useState` e inclui:

```typescript
interface GameState {
  mainBoard: MainBoard;                    // Todos os mini tabuleiros
  miniBoardWinners: MiniBoardWinners;      // Rastreamento de vitórias
  currentPlayer: Player;                   // Jogador da vez
  nextBoardPosition: [number, number] | null;  // Próximo tabuleiro obrigatório
  gameWinner: Player | 'draw' | null;      // Vencedor do jogo
  isGameOver: boolean;                     // Status do jogo
}
```

## 🎯 Funcionalidades

- ✅ Jogabilidade completa do Ultimate Tic-Tac-Toe
- ✅ Destaque visual do mini tabuleiro ativo
- ✅ Indicação clara do jogador da vez
- ✅ Detecção de vitória em mini tabuleiros
- ✅ Detecção de vitória no jogo principal
- ✅ Detecção de empate
- ✅ Opção de reiniciar partida
- ✅ Regras do jogo integradas na interface
- ✅ Animações e transições suaves
- ✅ Totalmente responsivo

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- npm, yarn, pnpm ou bun

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Build de Produção

```bash
# Criar build otimizado
npm run build

# Iniciar servidor de produção
npm start
```

## 🎨 Customização

### Cores

As cores dos jogadores e estados podem ser customizadas em `components/Cell.tsx` e `components/MiniBoard.tsx`:

- **Jogador X**: Azul (`text-blue-600`)
- **Jogador O**: Vermelho (`text-red-600`)
- **Tabuleiro ativo**: Borda azul (`border-blue-500`)

### Estilos

Os estilos são implementados com Tailwind CSS, facilitando customizações rápidas através de classes utilitárias.

## 📝 Código Limpo

- **TypeScript**: Tipagem forte para prevenir erros
- **Componentização**: Separação clara de responsabilidades
- **Imutabilidade**: Estado atualizado de forma imutável
- **Comentários**: Documentação de lógica complexa
- **Semântica**: Código legível e autoexplicativo

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

Desenvolvido com ❤️ usando Next.js e React

