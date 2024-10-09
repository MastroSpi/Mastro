const remoteVideo = document.getElementById('remoteVideo');
const socket = io('https://your-signaling-server-url'); // Inserisci qui l'URL del server di segnalazione

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
    remoteVideo.srcObject = event.streams[0];
  };

  socket.on('offerOrAnswer', async (data) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('offerOrAnswer', answer);
  });

  socket.on('candidate', (candidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  });
}

createPeerConnection();
