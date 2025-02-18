const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');

// Initialisation de l'application Express  
const app = express();

// Configurations HTTPS  
const options = {
    key: fs.readFileSync('/home/gleaphe/Desktop/Cyber/localhost.key'),
    cert: fs.readFileSync('/home/gleaphe/Desktop/Cyber/localhost.crt')
};

// Création du serveur HTTPS  
const server = https.createServer(options, app);
const io = socketIo(server); // Attacher Socket.IO au serveur HTTPS

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Stockage des utilisateurs connectés  
const connectedUsers = {}; // Object pour stocker les utilisateurs

io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté');

    // Écouter l'événement 'join' pour l'authentification des utilisateurs  
    socket.on('join', (username) => {
        if (!username || username.trim() === '') {
            console.log('Connexion refusée : nom d\'utilisateur manquant.');
            socket.disconnect(); // Déconnecter l'utilisateur  
            return;
        }

        connectedUsers[socket.id] = username; // Ajouter l'utilisateur à la liste  
        io.emit('updateUserList', Object.values(connectedUsers)); // Mettre à jour la liste des utilisateurs pour tous  
        console.log(`${username} a rejoint`);

        // Informer l'utilisateur qui se connecte de la liste des autres utilisateurs  
        socket.emit('updateUserList', Object.values(connectedUsers));
    });

    // Écouter l'événement 'broadcaster' pour le streaming  
    socket.on('broadcaster', (stream) => {
        // Émettre le flux aux autres utilisateurs  
        socket.broadcast.emit('viewer', { id: socket.id, stream }); 
    });

    // Écouter l'événement 'chatMessage'  
    socket.on('chatMessage', (data) => {
        if (connectedUsers[socket.id]) {
            // Émettre le message à tous les clients connectés  
            io.emit('chatMessage', data); 
        } else {
            console.log('Message refusé : utilisateur non authentifié.');
            socket.emit('unauthorized', 'Vous devez vous authentifier pour envoyer des messages.');
        }
    });

    socket.on('disconnect', () => {
        // Retirer l'utilisateur de la liste des connectés  
        const username = connectedUsers[socket.id];
        delete connectedUsers[socket.id];
        io.emit('updateUserList', Object.values(connectedUsers)); // Mettre à jour la liste des utilisateurs  
        console.log(`${username} s'est déconnecté`);
    });
});

// Démarrer le serveur  
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur en cours d'exécution sur https://localhost:${PORT}`);
});


