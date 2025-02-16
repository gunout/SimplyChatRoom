const https = require('https');
const fs = require('fs');
const express = require('express');
const socketIo = require('socket.io');

const app = express();

// Configurations HTTPS
const options = {
  key: fs.readFileSync('https://github.com/gunout/SimplyChatRoom/blob/main/localhost.key?raw=true'), // Chemin vers votre fichier clé
  cert: fs.readFileSync('https://github.com/gunout/SimplyChatRoom/blob/main/localhost.crt?raw=true') // Chemin vers votre fichier certificat
};

// Création du serveur HTTPS
const server = https.createServer(options, app);
const io = socketIo(server);

// Middleware pour servir des fichiers statiques
app.use(express.static('public'));

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté');

    socket.on('broadcaster', (stream) => {
        socket.broadcast.emit('viewer', stream);
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur est déconnecté');
    });
});

// Port d'écoute
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur https://localhost:${PORT}`);
});


