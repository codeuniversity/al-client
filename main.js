var canvas = document.getElementById("canvas3");
canvas.width = window.innerWidth;
canvas.width = window.innerWidth;
console.log(window.innerHeight);
console.log(window.innerWidth);
canvas.height = window.innerHeight;
var ctx = canvas.getContext("2d");

window.onresize = function (){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

var socket = new WebSocket('ws://localhost:4000');

function draw_cell(x, y, r, color){
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath()
}

// Connection opened
socket.addEventListener('open', function (event) {
    console.log("Socket established")
});

// Listen for messages
socket.addEventListener('message', function (event) {
  ctx.clearRect(0,0,canvas.width,canvas.height)
  JSON.parse(event.data).forEach(e => {
    var pos = e['pos']
    draw_cell(pos['x'], pos['y'], 5,"white")
  });
});