# Ultimate Tic-Tac-Toe - Multiplayer Online

## 🎮 Sobre o Jogo

Aplicação web completa de **Ultimate Tic-Tac-Toe** (ou Meta Jogo da Velha) com modo multiplayer online. Construído com Next.js 16, React 19 e TypeScript 5.

## ✨ Funcionalidades

✅ **Jogo Local** - Jogue contra um amigo no mesmo dispositivo  
✅ **Multiplayer Online** - Crie salas e jogue online com qualquer pessoa  
✅ **Sistema de Salas** - Códigos únicos de 6 caracteres para compartilhar  
✅ **Sincronização em Tempo Real** - Polling HTTP a cada 1.5s (funciona 100% na Vercel)  
✅ **Design Responsivo** - Mobile-first, otimizado para celulares e tablets  
✅ **Alternância de Turnos** - Sistema justo que alterna quem começa entre as partidas  
✅ **Reconexão Automática** - Reconecte se perder a conexão  

## 🏗️ Arquitetura

### Stack Tecnológico

- **Framework**: Next.js 16.1.1 (App Router + Turbopack)
- **Frontend**: React 19.2.3 com TypeScript 5
- **Estilização**: Tailwind CSS 4
- **Comunicação**: HTTP Polling (REST API)
- **Deploy**: Vercel (100% serverless)

### Por que HTTP Polling em vez de WebSocket?

Inicialmente usamos Socket.io, mas **Vercel não suporta conexões WebSocket persistentes** no modelo serverless. A solução foi implementar **HTTP polling** que:

- ✅ Funciona perfeitamente na Vercel (sem servidores externos)
- ✅ Polling a cada 1.5 segundos (suficiente para jogo por turnos)
- ✅ Sem custo adicional de infraestrutura
- ✅ Estado armazenado em memória no servidor (resetado em cold starts, mas OK para sessões de jogo)

## 📁 Estrutura do Projeto

```
ultimate-tic-tac-toe/
├── app/
│   ├── api/
│   │   └── rooms/
│   │       └── route.ts          # API REST para gerenciar salas
│   ├── multiplayer/
│   │   ├── page.tsx              # Lobby (criar/entrar em salas)
│   │   └── game/
│   │       └── page.tsx          # Página do jogo multiplayer
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Página inicial (modo local)
├── components/
│   ├── MainBoard.tsx             # Tabuleiro principal 3x3
│   ├── MiniBoard.tsx             # Mini tabuleiro 3x3
│   └── Cell.tsx                  # Célula individual
├── hooks/
│   └── useGameRoom.ts            # Hook para comunicação HTTP
├── utils/
│   └── gameLogic.ts              # Lógica do jogo
├── types/
│   └── game.ts                   # TypeScript types
└── server.js                     # Servidor local (dev only)
```

## 🚀 Rodando Localmente

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]

# Entre na pasta
cd ultimate-tic-tac-toe

# Instale as dependências
npm install

# Rode em desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

### Modo de Desenvolvimento

O projeto tem **dois ambientes de desenvolvimento**:

1. **`npm run dev`** - Usa `server.js` com Socket.io (portas 3000 + 3001)
   - Ótimo para desenvolvimento local rápido
   - Socket.io para comunicação em tempo real
   
2. **`npm run dev:vercel`** - Usa apenas Next.js (porta 3000)
   - Simula exatamente o ambiente da Vercel
   - HTTP polling como em produção
   - **Use este para testar antes de fazer deploy!**

## 📦 Deploy na Vercel

```bash
# Build de produção
npm run build

# Deploy (instale a CLI da Vercel se necessário: npm i -g vercel)
vercel --prod
```

O projeto está **100% otimizado para Vercel**:
- Sem configuração adicional necessária
- Sem variáveis de ambiente obrigatórias
- Sem servidores externos (Render, Railway, etc.)

## 🎯 Como Jogar

### Modo Local
1. Clique em "Jogar Localmente" na página inicial
2. Jogue alternando entre os jogadores X e O

### Modo Multiplayer
1. Clique em "Multiplayer Online"
2. Digite seu nome
3. **Criar Sala**: Gera código único de 6 caracteres
4. **Entrar em Sala**: Digite o código compartilhado pelo amigo
5. Compartilhe o link ou código com seu oponente
6. Jogue! As jogadas sincronizam automaticamente

## 🔧 Arquitetura da API

### Endpoint: `/api/rooms` (POST)

**Actions disponíveis:**

#### 1. Create Room
```typescript
POST /api/rooms
{
  "action": "create-room",
  "playerName": "João"
}

Resposta: {
  "success": true,
  "roomId": "ABC123",
  "playerNumber": 1
}
```

#### 2. Join Room
```typescript
POST /api/rooms
{
  "action": "join-room",
  "roomId": "ABC123",
  "playerName": "Maria"
}

Resposta: {
  "success": true,
  "roomId": "ABC123",
  "playerNumber": 2,
  "players": [...]
}
```

#### 3. Get Room (Polling)
```typescript
POST /api/rooms
{
  "action": "get-room",
  "roomId": "ABC123"
}

Resposta: {
  "success": true,
  "room": {
    "id": "ABC123",
    "players": [...],
    "gameState": {...},
    "lastActivity": 1234567890
  }
}
```

#### 4. Make Move
```typescript
POST /api/rooms
{
  "action": "make-move",
  "roomId": "ABC123",
  "playerNumber": 1,
  "gameState": {...}
}
```

#### 5. Restart Game
```typescript
POST /api/rooms
{
  "action": "restart-game",
  "roomId": "ABC123"
}

Resposta: {
  "success": true,
  "startingPlayer": 2
}
```

### Limpeza Automática

Salas inativas por mais de **30 minutos** são automaticamente removidas da memória.

## 🎨 Regras do Ultimate Tic-Tac-Toe

1. O tabuleiro é composto por 9 mini tabuleiros 3x3
2. Para vencer, você precisa vencer 3 mini tabuleiros em linha
3. **Regra Principal**: Sua jogada determina em qual mini tabuleiro o oponente deve jogar
   - Se você joga na célula superior direita de um mini tabuleiro, o oponente deve jogar no mini tabuleiro superior direito
4. Se o mini tabuleiro obrigatório estiver cheio ou ganho, o jogador pode escolher qualquer mini tabuleiro disponível
5. Vence quem formar uma linha (horizontal, vertical ou diagonal) de mini tabuleiros conquistados primeiro

## 🐛 Troubleshooting

### Salas não sincronizam

- **Causa**: Polling não está funcionando
- **Solução**: Verifique o console do navegador (F12). O polling deve acontecer a cada 1.5s

### Erro 404 ao criar sala

- **Causa**: API Route não está sendo servida
- **Solução**: 
  ```bash
  # Limpe o cache e rebuilde
  rm -rf .next
  npm run build
  npm start
  ```

### Estado do jogo resetou

- **Causa**: Vercel fez um "cold start" (normal em serverless)
- **Solução**: Isso é esperado. Salas são temporárias e vivem apenas enquanto houver atividade

## 📝 Notas Técnicas

### Limitações do Modelo Serverless

- **Estado em memória**: Salas são armazenadas em `Map()` no servidor
- **Cold starts**: Se não houver requisições por alguns minutos, a Vercel desliga o servidor e o estado é perdido
- **Não é persistente**: Não usamos banco de dados (proposital para simplicidade)

### Por que isso é OK?

- Jogo de sessão curta (10-15 minutos por partida)
- Sem necessidade de histórico
- Foco em simplicidade e zero custo operacional

### Alternativas para Produção

Se precisar de persistência:
- Adicione Redis (Upstash) para estado distribuído
- Use Supabase/PlanetScale para histórico de partidas
- Implemente autenticação (NextAuth.js)

## 📄 Licença

MIT

## 👨‍💻 Autor

Criado para a UTFPR

