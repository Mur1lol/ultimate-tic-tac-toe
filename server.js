const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Estrutura para armazenar salas de jogo
const rooms = new Map();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Configurar Socket.io
  const io = new Server(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    transports: ['polling', 'websocket'],
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Reconectar a uma sala existente
    socket.on('rejoin-room', ({ roomId, playerNumber, playerName }) => {
      console.log(`Jogador tentando reconectar à sala ${roomId} como jogador ${playerNumber}`);
      const room = rooms.get(roomId);
      
      if (!room) {
        console.log(`Sala ${roomId} não encontrada para reconexão!`);
        socket.emit('error', { message: 'Sala não encontrada' });
        return;
      }

      socket.join(roomId);
      
      // Atualizar o socket ID do jogador
      const playerIndex = playerNumber - 1;
      if (room.players[playerIndex]) {
        const oldSocketId = room.players[playerIndex].id;
        room.players[playerIndex].id = socket.id;
        room.players[playerIndex].name = playerName;
        console.log(`✓ Jogador ${playerNumber} reconectado à sala ${roomId} (${oldSocketId} -> ${socket.id})`);
        
        // Se já tiver 2 jogadores, notificar sobre o oponente e status do jogo
        if (room.players.length === 2) {
          const opponentIndex = playerIndex === 0 ? 1 : 0;
          const opponent = room.players[opponentIndex];
          
          socket.emit('opponent-info', { name: opponent.name });
          socket.emit('opponent-joined', { name: opponent.name });
          socket.emit('game-start', { players: room.players });
          
          // Enviar o estado atual do jogo se existir (para evitar reset na reconexão)
          if (room.gameState) {
            console.log(`Enviando gameState existente para jogador reconectado ${playerNumber}`);
            socket.emit('sync-game-state', { 
              gameState: room.gameState,
              currentTurn: room.currentTurn // 0 = jogador 1, 1 = jogador 2
            });
          }
          
          // Notificar o oponente que este jogador reconectou (se estiver conectado)
          io.to(opponent.id).emit('opponent-joined', { name: playerName });
          
          console.log(`✓ Ambos jogadores conectados na sala ${roomId}`);
        }
      } else {
        console.log(`⚠ Índice de jogador inválido: ${playerIndex} na sala ${roomId}`);
      }
    });

    // Criar nova sala
    socket.on('create-room', ({ playerName }) => {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      socket.join(roomId);
      
      rooms.set(roomId, {
        players: [{ id: socket.id, name: playerName }],
        gameState: null,
        currentTurn: 0
      });

      socket.emit('room-created', { roomId, playerNumber: 1 });
      console.log(`Sala criada: ${roomId} por ${playerName} (${socket.id})`);
      console.log('Total de salas:', rooms.size);
    });

    // Entrar em sala existente
    socket.on('join-room', ({ roomId, playerName }) => {
      console.log(`Tentando entrar na sala ${roomId} com nome ${playerName}`);
      console.log('Salas disponíveis:', Array.from(rooms.keys()));
      const room = rooms.get(roomId);
      
      if (!room) {
        console.log(`Sala ${roomId} não encontrada!`);
        socket.emit('error', { message: 'Sala não encontrada' });
        return;
      }

      if (room.players.length >= 2) {
        socket.emit('error', { message: 'Sala cheia' });
        return;
      }

      socket.join(roomId);
      room.players.push({ id: socket.id, name: playerName });

      console.log(`Jogador 2 (${playerName}, ${socket.id}) adicionado à sala ${roomId}`);
      console.log('Jogadores na sala:', room.players);

      socket.emit('room-joined', { roomId, playerNumber: 2 });
      
      // Notificar jogador 1 que jogador 2 entrou
      console.log(`Notificando jogador 1 (${room.players[0].id}) sobre jogador 2`);
      io.to(room.players[0].id).emit('opponent-joined', { name: playerName });
      
      // Notificar jogador 2 sobre jogador 1
      socket.emit('opponent-info', { name: room.players[0].name });
      
      // Iniciar jogo com informações dos jogadores
      console.log(`Enviando game-start para sala ${roomId}`);
      io.to(roomId).emit('game-start', { 
        players: room.players
      });

      console.log(`✓ Jogador 2 (${playerName}) entrou na sala: ${roomId}`);
      console.log(`✓ Jogo iniciado com ${room.players.length} jogadores`);
    });

    // Sincronizar jogada
    socket.on('make-move', ({ roomId, move, gameState }) => {
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Sala não encontrada' });
        return;
      }

      // Verificar se é a vez do jogador
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== room.currentTurn) {
        socket.emit('error', { message: 'Não é sua vez' });
        return;
      }

      // Atualizar estado do jogo
      room.gameState = gameState;
      room.currentTurn = (room.currentTurn + 1) % 2;

      // Enviar jogada para o oponente
      socket.to(roomId).emit('opponent-move', { move, gameState });
    });

    // Reiniciar jogo
    socket.on('restart-game', (roomId) => {
      const room = rooms.get(roomId);
      
      if (room) {
        room.gameState = null;
        // Alternar quem começa: se era 0 (jogador 1), vira 1 (jogador 2), e vice-versa
        room.currentTurn = room.currentTurn === 0 ? 1 : 0;
        
        console.log(`[Restart] Sala ${roomId} reiniciada. Jogador ${room.currentTurn + 1} começa.`);
        
        // Enviar evento de restart para ambos jogadores com info de quem começa
        io.to(roomId).emit('game-restarted', {
          startingPlayer: room.currentTurn + 1 // 1 ou 2
        });
      }
    });

    // Desconexão
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
      
      // Aguardar 3 segundos antes de notificar desconexão (tempo para reconexão)
      setTimeout(() => {
        rooms.forEach((room, roomId) => {
          const playerIndex = room.players.findIndex(p => p.id === socket.id);
          if (playerIndex !== -1) {
            console.log(`⚠ Jogador ${playerIndex + 1} ainda desconectado da sala ${roomId} após 3s`);
            
            // Notificar outros jogadores conectados
            const otherPlayers = room.players.filter((p, idx) => idx !== playerIndex && p.id !== socket.id);
            otherPlayers.forEach(player => {
              console.log(`Notificando jogador ${player.id} sobre desconexão`);
              io.to(player.id).emit('opponent-disconnected');
            });
          }
        });
      }, 3000); // Aguardar 3 segundos para dar tempo de reconectar
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log('> Socket.io inicializado');
    });
});
