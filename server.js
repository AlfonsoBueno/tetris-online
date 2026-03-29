// ═══════════════════════════════════════════════════════════════
//  TETRIS ONLINE — Servidor WebSocket
//  Node.js puro, sin dependencias externas salvo 'ws'
// ═══════════════════════════════════════════════════════════════
const http = require('http');
const fs   = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = process.env.PORT || 3000;

// ── HTTP: sirve index.html y assets estáticos ─────────────────
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'public',
    req.url === '/' ? 'index.html' : req.url);

  const ext = path.extname(filePath);
  const mime = { '.html':'text/html', '.js':'application/javascript',
                 '.css':'text/css', '.ico':'image/x-icon' };
  const ct = mime[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404); res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': ct });
      res.end(data);
    }
  });
});

// ── SALAS ─────────────────────────────────────────────────────
// rooms: Map<roomId, { players: [ws, ws?], started: bool }>
const rooms = new Map();

function genId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function send(ws, obj) {
  if (ws && ws.readyState === WebSocket.OPEN)
    ws.send(JSON.stringify(obj));
}

function broadcast(room, obj, excludeWs = null) {
  for (const p of room.players)
    if (p && p !== excludeWs) send(p, obj);
}

// ── WEBSOCKET ─────────────────────────────────────────────────
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws._roomId  = null;
  ws._slot    = null; // 0 = P1, 1 = P2

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {

      // ── Crear sala ──────────────────────────────────────────
      case 'create': {
        const id = genId();
        rooms.set(id, { players: [ws, null], started: false });
        ws._roomId = id;
        ws._slot   = 0;
        send(ws, { type: 'created', roomId: id, slot: 0 });
        console.log(`[${id}] Sala creada`);
        break;
      }

      // ── Unirse a sala ───────────────────────────────────────
      case 'join': {
        const id   = (msg.roomId || '').toUpperCase().trim();
        const room = rooms.get(id);

        if (!room) {
          send(ws, { type: 'error', msg: 'Sala no encontrada' }); break;
        }
        if (room.players[1]) {
          send(ws, { type: 'error', msg: 'Sala llena' }); break;
        }
        if (room.started) {
          send(ws, { type: 'error', msg: 'Partida en curso' }); break;
        }

        room.players[1] = ws;
        ws._roomId = id;
        ws._slot   = 1;

        // Confirmar a P2
        send(ws,           { type: 'joined', roomId: id, slot: 1 });
        // Avisar a P1 que ya puede empezar
        send(room.players[0], { type: 'opponent_joined' });
        room.started = true;
        console.log(`[${id}] P2 se unió — partida iniciada`);
        break;
      }

      // ── Estado del tablero propio (enviado cada frame) ──────
      // El cliente envía su board comprimido + pieza activa
      case 'state': {
        const room = rooms.get(ws._roomId);
        if (!room) break;
        const other = room.players[1 - ws._slot];
        // Reenviar al rival tal cual
        send(other, { type: 'opponent_state', state: msg.state });
        break;
      }

      // ── Ataque: líneas de basura ────────────────────────────
      case 'attack': {
        const room = rooms.get(ws._roomId);
        if (!room) break;
        const other = room.players[1 - ws._slot];
        send(other, { type: 'garbage', lines: msg.lines });
        break;
      }

      // ── Game over (quien pierde avisa al server) ────────────
      case 'game_over': {
        const room = rooms.get(ws._roomId);
        if (!room) break;
        const other = room.players[1 - ws._slot];
        send(other, { type: 'opponent_dead', score: msg.score });
        console.log(`[${ws._roomId}] Partida terminada`);
        // Limpiar sala
        rooms.delete(ws._roomId);
        break;
      }

      // ── Ping / pong heartbeat ───────────────────────────────
      case 'ping':
        send(ws, { type: 'pong' }); break;
    }
  });

  ws.on('close', () => {
    const room = rooms.get(ws._roomId);
    if (!room) return;
    const other = room.players[1 - ws._slot];
    send(other, { type: 'opponent_disconnected' });
    rooms.delete(ws._roomId);
    console.log(`[${ws._roomId}] Sala eliminada (desconexión)`);
  });
});

server.listen(PORT, () =>
  console.log(`Tetris online escuchando en puerto ${PORT}`)
);
