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

# PS : LINE 1 OF "script.js" change the ip by your ip public !!!

TU PEUX RAJOUTER LA FONCTION SUIVANTE DANS LE FICHIER index.html 

POUR RECEVOIR LES FLUX D'AUTRES WEBCAMS UTILISATEURS !

# fonctions recevoir les flux des autres utilisateurs 

// Recevoir les flux vidéo des autres utilisateurs

socket.on('viewer', (stream) => {

const videoElement = document.createElement('video');

videoElement.srcObject = stream;

videoElement.autoplay = true;

webcamContainer.appendChild(videoElement);
        
});

