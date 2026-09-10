import mongoose from 'mongoose';

const authoritySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['Road Safety Department', 'Traffic Police', 'Police']
    },
    code: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    jurisdiction: {
      type: String,
      default: 'Metropolitan Urban Transport Area'
    },
    primaryContact: {
      email: { type: String, default: 'dispatch@urban-intelligence.local' },
      phone: { type: String, default: '+91-161-2401000' }
    },
    color: {
      type: String,
      default: '#2563eb'
    },
    icon: {
      type: String,
      default: 'Shield'
    },
    categories: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

const Authority = mongoose.model('Authority', authoritySchema);

export default Authority;
