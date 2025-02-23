        const socket = io('https://102.35.99.37:3000'); // Connexion au serveur  
        const webcamContainer = document.getElementById('webcamContainer');
        const messagesDiv = document.getElementById('messages');
        const usernameInput = document.getElementById('usernameInput');
        const messageInput = document.getElementById('messageInput');
        const radioUrlInput = document.getElementById('radioUrlInput');
        const playRadioButton = document.getElementById('playRadioButton');
        const pauseRadioButton = document.getElementById('pauseRadioButton');
        const stopRadioButton = document.getElementById('stopRadioButton');
        const volumeControl = document.getElementById('volumeControl');
        const shareScreenButton = document.getElementById('shareScreenButton');
        const stopWebcamButton = document.getElementById('stopWebcamButton');
        const restartWebcamButton = document.getElementById('restartWebcamButton'); // Nouveau bouton pour redémarrer la webcam  
        const userList = document.getElementById('userList'); // Liste des utilisateurs

        let localStream;
        let users = new Set(); // Utiliser un Set pour garder la trace des utilisateurs

        // Fonction pour commencer la webcam  
        async function startWebcam() {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                addLocalVideo(localStream);
                socket.emit('broadcaster', localStream); // Émettre le flux vidéo  
            } catch (error) {
                console.error("Erreur d'accès à la webcam : ", error);
            }
        }

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
                            webcamContainer.innerHTML = ''; // Effacer la fenêtre de partage d'écran  
                        };
                    });
                })
                .catch((error) => {
                    console.error("Erreur lors du partage d'écran : ", error);
                });
        });

        // Fonction pour arrêter la webcam  
        stopWebcamButton.addEventListener('click', () => {
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    track.stop(); // Arrêter les pistes de la webcam  
                });
                webcamContainer.innerHTML = ''; // Effacer tous les éléments vidéo  
            }
        });

        // Fonction pour redémarrer la webcam  
        restartWebcamButton.addEventListener('click', () => {
            startWebcam(); // Redémarrer la webcam  
        });

        // Fonction pour jouer la radio  
        playRadioButton.addEventListener('click', () => {
            const radioUrl = radioUrlInput.value.trim();
            if (radioUrl) {
                audioElement.src = radioUrl;

                audioElement.addEventListener('error', () => {
                    console.error("Erreur lors de la lecture de la radio, vérifiez l'URL ou le format.");
                });

                audioElement.play().then(() => {
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

                // Ajouter l'utilisateur à la liste des utilisateurs connectés  
                if (username) {
                    users.add(username);
                    updateUserList();
                }
            }
        }

        function updateUserList() {
            userList.innerHTML = '<h3>Utilisateurs Connectés</h3>'; // Réinitialiser la liste  
            users.forEach(user => {
                userList.innerHTML += `<div class="user-item">${user}</div>`; // Ajouter chaque utilisateur  
            });
            // Émettre la mise à jour des utilisateurs à tous les clients  
            socket.emit('updateUserList', Array.from(users));
        }

        // Recevoir les messages des autres utilisateurs  
        socket.on('chatMessage', (data) => {
            if (!messagesDiv.innerHTML.includes(`<strong>${data.username}:</strong> ${data.message}`)) {
                messagesDiv.innerHTML += `<p><strong>${data.username}:</strong> ${data.message}</p>`;
            }
        });

        // Recevoir les mises à jour de la liste des utilisateurs  
        socket.on('updateUserList', (userArray) => {
            users = new Set(userArray); // Mettre à jour le Set des utilisateurs  
            updateUserList(); // Réactualiser l'affichage de la liste  
        });
    </script>
