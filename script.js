const socket = io();

const localVideo = document.getElementById('localVideo');
const messagesDiv = document.getElementById('messages');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');
const sendMessageButton = document.getElementById('sendMessage');

// Demander l'accès à la webcam  
async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = stream;
        socket.emit('stream', stream); // Émettre le flux  
    } catch (error) {
        console.error("Erreur d'accès à la webcam : ", error);
    }
}

// Écouter les messages  
socket.on('chatMessage', function(data) {
    const messageElement = document.createElement('p');
    messageElement.textContent = `${data.username}: ${data.message}`;
    messagesDiv.appendChild(messageElement);
});

// Envoyer un message  
sendMessageButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();
    if (username && message) {
        const messageData = { username, message };
        messagesDiv.innerHTML += `<p><strong>${username}:</strong> ${message}</p>`;
        socket.emit('chatMessage', messageData); // Émettre le message  
        messageInput.value = ''; // Réinitialiser le champ de message  
    }
});

// Démarrer la webcam au chargement de la page  
window.onload = startWebcam;
