const localVideo = document.getElementById('localVideo');
const startButton = document.getElementById('startButton');
const socket = io('https://your-signaling-server-url'); // Inserisci qui l'URL del server di segnalazione

let localStream;
let peerConnection;
const config = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

function createPeerConnection() {
  peerConnection = new RTCPeerConnection(config);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('candidate', event.candidate);
    }
  };

  peerConnection.ontrack = (event) => {
    localVideo.srcObject = event.streams[0];
  };

  socket.on('offerOrAnswer', (data) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(data));
  });

  socket.on('candidate', (candidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  });
}

async function startTransmission() {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  localVideo.srcObject = localStream;

  createPeerConnection();
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit('offerOrAnswer', offer);
}

startButton.addEventListener('click', startTransmission);
