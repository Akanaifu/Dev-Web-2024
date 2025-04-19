// utiliser pour le websocket

const socket = io()

const clientsTotal = document.getElementById('client-total');

socket.on('clients-total',(data) => {
    clientsTotal.innerText = `Total clients : ${data}`
})
