const socket=io()
// socket.emit('churan')
// socket.on('churan papdi',()=>{
//     console.log('churan papdi received')
// })
// socket.on('disconnected',()=>{
//     console.log('user left')
// })
const chess=new Chess()
const boardelement=document.querySelector('#chessboard')
let dragedpiece=null;
let sourcesquare=null;
let playerrole=null;

const renderboard=()=>{
   const board=chess.board();
   boardelement.innerHTML=""
   board.forEach((row,rowindex) => {
      row.forEach((square,squareindex)=>{
        const squareelement=document.createElement("div");
        squareelement.classList.add("square",
         (rowindex+squareindex)%2===0?"light":"dark"
        );
        squareelement.dataset.row=rowindex;
        squareelement.dataset.col=squareindex;
        if(square){
          const pieceelement=document.createElement('div');
          pieceelement.classList.add("piece",square.color==='w'?"white":"black");
          pieceelement.innerHTML=getpieceunicode(square);
          pieceelement.draggable=playerrole===square.color;
          pieceelement.addEventListener('dragstart',(e)=>{
            if(pieceelement.draggable){
               dragedpiece=pieceelement;
               sourcesquare={row:rowindex,col:squareindex};
               e.dataTransfer.setData('text/plain',"");
            }
          });
          pieceelement.addEventListener('dragend',(e)=>{
            dragedpiece=null;
            sourcesquare=null;
          })
          squareelement.append(pieceelement) ;
        }
       squareelement.addEventListener("dragover",(e)=>{
           e.preventDefault();
       })
       squareelement.addEventListener('drop',(e)=>{
          e.preventDefault();
          if(dragedpiece){
            const targetsource={
               row:parseInt(squareelement.dataset.row),
               col:parseInt(squareelement.dataset.col)
            }
            handlemove(sourcesquare,targetsource);
          }
        })
        boardelement.appendChild(squareelement)
      })
   });
   if(playerrole ==='b'){
      boardelement.classList.add('flipped')
   }
   else{
      boardelement.classList.remove('flipped')
   }
}
const handlemove=(source,target)=>{
  const move={
    from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
    to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
    promotion:'q'
  }
  socket.emit("move",move)
}
const getpieceunicode=(piece)=>{
  const unicodepieces={
     P: '♟', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
     p: '♙', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
  }
 return unicodepieces[piece.type] || "";
}
socket.on('playerrole',(role)=>{
   playerrole=role;
   renderboard();
})
socket.on('spectatorrole',()=>{
   playerrole=null;
   renderboard();
})
socket.on('boardstate',(fen)=>{
   chess.load(fen);
   renderboard();
})
socket.on("move",()=>{
   chess.move(move);
   renderboard();
})
socket.on('Invalid move',()=>{
   alert('Invalid Move')
})
socket.on('opponentLeft', () => {
   alert('Your opponent has left the game. You win!');
});
renderboard();
