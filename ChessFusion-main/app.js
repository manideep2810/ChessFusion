const express = require('express');
const socket = require('socket.io');
const http = require('http');
const { Chess } = require('chess.js');
const app = express();
const path = require('path');
const Server = http.createServer(app);
const io = socket(Server);

const chess = new Chess();
let players = {};

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
  res.render('index', { title: "chess" });
});

io.on('connection', (uniquesocket) => {
  if (!players.white) {
    players.white = uniquesocket.id;
    uniquesocket.emit('playerrole', 'w');
    uniquesocket.emit('boardstate', chess.fen()); // Send current board state
  } else if (!players.black) {
    players.black = uniquesocket.id;
    uniquesocket.emit('playerrole', 'b');
    uniquesocket.emit('boardstate', chess.fen()); // Send current board state
  } else {
    uniquesocket.emit('spectatorrole');
    uniquesocket.emit('boardstate', chess.fen()); // Send current board state
  }

  uniquesocket.on('disconnect', () => {
    if (uniquesocket.id === players.white) {
      delete players.white;
      if (players.black) {
        io.to(players.black).emit('opponentLeft');
      }
    } else if (uniquesocket.id === players.black) {
      delete players.black;
      if (players.white) {
        io.to(players.white).emit('opponentLeft');
      }
    }
  });

  uniquesocket.on("move", (move) => {
    try {
      if (chess.turn() === 'w' && uniquesocket.id !== players.white) return;
      if (chess.turn() === 'b' && uniquesocket.id !== players.black) return;
      const result = chess.move(move);
      if (result) {
        io.emit("move", move);
        io.emit("boardstate", chess.fen());
      } else {
        uniquesocket.emit("invalid move", move);
      }
    } catch (err) {
      console.log(err);
      uniquesocket.emit("invalid move", move);
    }
  });
});

Server.listen(3000, function () {
  console.log('listening on *:3000');
});

