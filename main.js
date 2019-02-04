const socket = new WebSocket('ws://localhost:4000');

// Connection opened
socket.addEventListener('open', function (event) {
    console.log("Socket established")
});
// Listen for messages
socket.addEventListener('message', function (event) {
  const data = JSON.parse(event.data)
  console.log(data)
  const container = document.getElementById("container");
  container.innerHTML = JSON.stringify(data)
});

