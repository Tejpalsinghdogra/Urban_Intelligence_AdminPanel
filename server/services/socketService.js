let ioInstance = null;

export function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.emit('connectionStatus', {
      connected: true,
      timestamp: new Date().toISOString(),
      message: 'Connected to UrbanSight Real-Time Dispatch Engine'
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

export function getIO() {
  return ioInstance;
}

export function emitNewDetection(detection) {
  if (ioInstance) {
    ioInstance.emit('newDetection', detection);
    console.log(`[Socket.IO] Emitted newDetection: ${detection.type} -> ${detection.authority}`);
  }
}

export function emitIncidentUpdated(incident) {
  if (ioInstance) {
    ioInstance.emit('incidentUpdated', incident);
    console.log(`[Socket.IO] Emitted incidentUpdated: ${incident._id} [${incident.routingStatus}]`);
  }
}

export function emitStatsUpdated(stats) {
  if (ioInstance) {
    ioInstance.emit('statsUpdated', stats);
  }
}

export default {
  initSocket,
  getIO,
  emitNewDetection,
  emitIncidentUpdated,
  emitStatsUpdated
};
