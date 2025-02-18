const socket = io(); // Connexion au serveur Socket.IO

const webcamContainer = document.getElementById('webcamContainer');
const messagesDiv = document.getElementById('messages');
const usernameInput = document.getElementById('usernameInput');
const messageInput = document.getElementById('messageInput');
const radioUrlInput = document.getElementById('radioUrlInput');
const sendButton = document.getElementById('sendButton');
const shareScreenButton = document.getElementById('shareScreenButton');
const playRadioButton = document.getElementById('playRadioButton');
const pauseRadioButton = document.getElementById('pauseRadioButton');
const stopRadioButton = document.getElementById('stopRadioButton');
const volumeControl = document.getElementById('volumeControl');

let localStream;
let audioElement = new Audio(); // Créer un élément audio pour la radio

// Fonction pour commencer la webcam  
async function startWebcam() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        addLocalVideo(localStream);
        socket.emit('broadcaster', localStream);
    } catch (error) {
        console.error("Erreur d'accès à la webcam : ", error);
    }
}

// Ajouter la vidéo locale au conteneur  
function addLocalVideo(stream) {
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    videoElement.muted = true; // Muet pour éviter l'écho  
    webcamContainer.appendChild(videoElement);
}

// Recevoir le flux vidéo des autres utilisateurs  
socket.on('broadcaster', (stream) => {
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    webcamContainer.appendChild(videoElement);
});

// Démarrer la webcam lorsque la page est chargée  
window.onload = startWebcam;

// Fonction pour partager l'écran  
shareScreenButton.addEventListener('click', () => {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then((screenStream) => {
            addLocalVideo(screenStream);
            socket.emit('broadcaster', screenStream);

            // Gérer la fin du partage d'écran  
            screenStream.getTracks().forEach(track => {
                track.onended = () => {
                    console.log("Le partage d'écran a été arrêté.");
                };
            });
        })
        .catch((error) => {
            console.error("Erreur lors du partage d'écran : ", error);
        });
});

// Fonction pour jouer la radio  
playRadioButton.addEventListener('click', () => {
    const radioUrl = radioUrlInput.value.trim();
    if (radioUrl) {
        audioElement.src = radioUrl;

        // Essayer de détecter le type du flux audio  
        audioElement.addEventListener('error', () => {
            console.error("Erreur lors de la lecture de la radio, vérifiez l'URL ou le format.");
        });

        audioElement.play().then(() => {
            // Effacer le champ de saisie après lecture  
            radioUrlInput.value = '';
        }).catch(error => {
            console.error("Erreur lors de la lecture de la radio : ", error);
        });
    }
});

// Fonction pour mettre la radio en pause  
pauseRadioButton.addEventListener('click', () => {
    audioElement.pause();
});

// Fonction pour arrêter la radio  
stopRadioButton.addEventListener('click', () => {
    audioElement.pause();
    audioElement.currentTime = 0; // Remettre le temps à zéro  
});

// Ajuster le volume de la radio  
volumeControl.addEventListener('input', () => {
    audioElement.volume = volumeControl.value; // Ajuster le volume  
});

// Fonction pour envoyer un message  
sendButton.addEventListener('click', () => {
    sendMessage();
});

// Ajout de l'événement pour envoyer un message en appuyant sur "Entrée"
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();
    if (username && message) {
        const messageData = { username, message };
        messagesDiv.innerHTML += `<p><strong>${username}:</strong> ${message}</p>`;
        messageInput.value = ''; // Réinitialiser le champ de message  
        socket.emit('chatMessage', messageData); // Émettre le message  
    }
}

// Recevoir les messages des autres utilisateurs  
socket.on('chatMessage', (data) => {
    // Vérifiez si le message reçu est le même que celui que vous avez envoyé  
    if (!messagesDiv.innerHTML.includes(`<strong>${data.username}:</strong> ${data.message}`)) {
        messagesDiv.innerHTML += `<p><strong>${data.username}:</strong> ${data.message}</p>`;
    }
});
