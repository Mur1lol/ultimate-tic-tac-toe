// Estado global do servidor (em memória)
// Nota: Na Vercel, isso persiste apenas durante a execução da function
const rooms = new Map();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, roomId, playerNumber, playerName, gameState, move } = body;

    switch (action) {
      case 'create-room': {
        const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        rooms.set(newRoomId, {
          players: [{ id: 1, name: playerName }],
          gameState: null,
          currentTurn: 0,
          lastUpdate: Date.now()
        });
        console.log(`Sala criada: ${newRoomId}`);
        return Response.json({ success: true, roomId: newRoomId, playerNumber: 1 });
      }

      case 'join-room': {
        const room = rooms.get(roomId);
        if (!room) {
          return Response.json({ success: false, error: 'Sala não encontrada' }, { status: 404 });
        }
        if (room.players.length >= 2) {
          return Response.json({ success: false, error: 'Sala cheia' }, { status: 400 });
        }
        
        room.players.push({ id: 2, name: playerName });
        room.lastUpdate = Date.now();
        console.log(`Jogador 2 entrou na sala: ${roomId}`);
        
        return Response.json({ 
          success: true, 
          roomId, 
          playerNumber: 2,
          players: room.players 
        });
      }

      case 'get-room': {
        const room = rooms.get(roomId);
        if (!room) {
          return Response.json({ success: false, error: 'Sala não encontrada' }, { status: 404 });
        }
        
        return Response.json({ 
          success: true, 
          room: {
            players: room.players,
            gameState: room.gameState,
            currentTurn: room.currentTurn
          }
        });
      }

      case 'make-move': {
        const room = rooms.get(roomId);
        if (!room) {
          return Response.json({ success: false, error: 'Sala não encontrada' }, { status: 404 });
        }

        const playerIndex = playerNumber - 1;
        if (playerIndex !== room.currentTurn) {
          return Response.json({ success: false, error: 'Não é sua vez' }, { status: 400 });
        }

        room.gameState = gameState;
        room.currentTurn = (room.currentTurn + 1) % 2;
        room.lastUpdate = Date.now();

        return Response.json({ success: true });
      }

      case 'restart-game': {
        const room = rooms.get(roomId);
        if (!room) {
          return Response.json({ success: false, error: 'Sala não encontrada' }, { status: 404 });
        }

        room.gameState = null;
        room.currentTurn = room.currentTurn === 0 ? 1 : 0;
        room.lastUpdate = Date.now();

        return Response.json({ 
          success: true,
          startingPlayer: room.currentTurn + 1
        });
      }

      default:
        return Response.json({ success: false, error: 'Ação inválida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro na API de rooms:', error);
    return Response.json({ success: false, error: 'Erro no servidor' }, { status: 500 });
  }
}

// Limpar salas inativas após 30 minutos
setInterval(() => {
  const now = Date.now();
  rooms.forEach((room, roomId) => {
    if (now - room.lastUpdate > 30 * 60 * 1000) {
      rooms.delete(roomId);
      console.log(`Sala ${roomId} removida por inatividade`);
    }
  });
}, 5 * 60 * 1000); // Verificar a cada 5 minutos

export const dynamic = 'force-dynamic';
