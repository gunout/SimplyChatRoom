const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public')); // Assurez-vous que votre fichier HTML est dans le dossier public

io.on('connection', (socket) => {
    console.log('Nouvel utilisateur connecté');

    socket.on('broadcaster', (stream) => {
        socket.broadcast.emit('viewer', stream);
    });

    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté');
    });
});

server.listen(3000, () => {
    console.log('Serveur en cours d\'exécution sur le port 3000');
});
