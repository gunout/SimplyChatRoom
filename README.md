# SimplyChatRoom

Simple Chat Room 

*STRUCTURE DU PROJET :

    /votre-projet
    │
    ├── /public
    │   └── index.html  (votre fichier HTML)
    │
    └── index.js  (votre fichier contenant le code du serveur)


1 . INSTALLEZ LES DEPENDANCES
    
    sudo apt update
    sudo apt install nodejs npm
    npm init -y
    npm install express socket.io


2 . RUN     

    node server.js

# PS : LINE 1 OF "script.js" CHANGE THE IP BY YOUR "IP PUBLIC" !!!



Tu peux rajouter la fonction suivante dans "index.html" 

pour recevoir les fluxs des autres utilisateurs !


# fonctions recevoir les flux des autres utilisateurs 


// Recevoir les flux vidéo des autres utilisateurs

socket.on('viewer', (stream) => {

const videoElement = document.createElement('video');

videoElement.srcObject = stream;

videoElement.autoplay = true;

webcamContainer.appendChild(videoElement);
        
});

