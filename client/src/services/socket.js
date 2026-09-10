import { io } from 'socket.io-client';

// Connect directly to the admin backend server on port 5050
const SOCKET_URL = 'http://localhost:5050';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

export function subscribeToDetections(onNewDetection) {
  socket.on('newDetection', onNewDetection);
  return () => {
    socket.off('newDetection', onNewDetection);
  };
}

export function subscribeToIncidentUpdates(onIncidentUpdated) {
  socket.on('incidentUpdated', onIncidentUpdated);
  return () => {
    socket.off('incidentUpdated', onIncidentUpdated);
  };
}

export default socket;
