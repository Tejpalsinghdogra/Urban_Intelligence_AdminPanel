import mongoose from 'mongoose';

const detectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      index: true
    },
    confidence: {
      type: Number,
      default: 0.85
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    locationName: {
      type: String,
      default: 'Urban Transport Corridor'
    },
    imageUrl: {
      type: String,
      default: null
    },
    count: {
      type: Number,
      default: 0
    },
    vehicleCount: {
      type: Number,
      default: 0
    },
    pedestrianCount: {
      type: Number,
      default: 0
    },
    congestionLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW'
    },
    authority: {
      type: String,
      enum: ['Road Safety Department', 'Traffic Police', 'Police'],
      index: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
      index: true
    },
    routingStatus: {
      type: String,
      enum: ['pending', 'routed', 'acknowledged', 'resolved'],
      default: 'routed',
      index: true
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        notes: String
      }
    ],
    notes: {
      type: String,
      default: ''
    },
    busId: {
      type: String,
      default: 'PB-08-BT-4021'
    },
    routeId: {
      type: String,
      default: 'Route-7 (Civil Lines - GT Road)'
    }
  },
  {
    timestamps: true,
    strict: false // Allows reading any extra metadata emitted by AI detector
  }
);

detectionSchema.index({ lat: 1, lng: 1 });
detectionSchema.index({ authority: 1, routingStatus: 1 });

const Detection = mongoose.model('Detection', detectionSchema);

export default Detection;
