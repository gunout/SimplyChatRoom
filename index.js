const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Remplacez par vos données de flux réelles
const streamData = "Données de flux";

// Servir les fichiers statiques du dossier public
app.use(express.static(__dirname + '/public'));

app.get('/stream', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(streamData);
    res.end();
});

io.on('connection', (socket) => {
    console.log('Nouvel utilisateur connecté');

    socket.on('broadcaster', (stream) => {
        socket.broadcast.emit('viewer', stream);
    });

    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});

